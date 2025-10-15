from django.test import TestCase
from django.contrib.auth.models import User
from .models import List
from routine_app.utils.total_expense import collect_item

# Create your tests here.

class ListModelTest(TestCase):
    """
    This test case is designed to test the List model and its relationships.
    It verifies that the List model is correctly created, and its relationships
    with the User model (brought_by and brought_to) work as expected.
    """

    def setUp(self):
        """
        The setUp method is called before every test method.
        It sets up the test environment by creating test data.
        """
        
        # Create three test users
        self.user1 = User.objects.create_user(username='user1', password='password123')  # User who brought the item
        self.user2 = User.objects.create_user(username='user2', password='password123')  # User to whom the item was brought
        self.user3 = User.objects.create_user(username='user3', password='password123')  # Another user to whom the item was brought

        # Create a List object representing an item (e.g., Milk)
        self.list_item = List.objects.create(
            item_name="Milk",  # Name of the item
            category=List.Category.GROCERIES,  # Category of the item (Groceries)
            price=2.50,  # Price of the item
            brought_by=self.user1  # User who brought the item
        )

        # Add user2 and user3 to the brought_to field of the List object
        self.list_item.brought_to.add(self.user2, self.user3)

    def test_list_creation(self):
        """
        Test that the List object is created correctly with the expected attributes.
        """
        # Assert that the item_name is "Milk"
        self.assertEqual(self.list_item.item_name, "Milk")

        # Assert that the category is "Groceries"
        self.assertEqual(self.list_item.category, List.Category.GROCERIES)

        # Assert that the price is 2.50
        self.assertEqual(self.list_item.price, 2.50)

        # Assert that the brought_by field is set to user1
        self.assertEqual(self.list_item.brought_by, self.user1)

    def test_brought_to_relationship(self):
        """
        Test that the brought_to field correctly stores the users to whom the item was brought.
        """
        # Get all users in the brought_to field of the List object
        brought_to_users = self.list_item.brought_to.all()

        # Assert that user2 is in the brought_to field
        self.assertIn(self.user2, brought_to_users)

        # Assert that user3 is in the brought_to field
        self.assertIn(self.user3, brought_to_users)

        # Assert that the total number of users in the brought_to field is 2
        self.assertEqual(brought_to_users.count(), 2)

    def test_reverse_relationship(self):
        """
        Test the reverse relationship (brought_to_you) from the User model to the List model.
        """
        # Get all List objects where user2 is in the brought_to field
        user2_lists = self.user2.brought_to_you.all()

        # Get all List objects where user3 is in the brought_to field
        user3_lists = self.user3.brought_to_you.all()

        # Assert that the List object (list_item) is in the brought_to_you field of user2
        self.assertIn(self.list_item, user2_lists)

        # Assert that the List object (list_item) is in the brought_to_you field of user3
        self.assertIn(self.list_item, user3_lists)

        # Assert that user2 has exactly one List object in the brought_to_you field
        self.assertEqual(user2_lists.count(), 1)

        # Assert that user3 has exactly one List object in the brought_to_you field
        self.assertEqual(user3_lists.count(), 1)


from django.test import TestCase
from django.contrib.auth.models import User
from .models import List
from .utils.total_expense import collect_item
from decimal import Decimal

class CollectItemTest(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create users
        self.buyer = User.objects.create_user(username='buyer', password='test123')
        self.user1 = User.objects.create_user(username='user1', password='test123')
        self.user2 = User.objects.create_user(username='user2', password='test123')

        # Create grocery item (7% tax)
        self.grocery_item = List.objects.create(
            item_name="Milk",
            category="grocery",
            price=Decimal("10.00"),
            brought_by=self.buyer
        )
        self.grocery_item.brought_to.add(self.user1, self.user2)

        # Create other item (5% tax)
        self.other_item = List.objects.create(
            item_name="Lamp",
            category="other",
            price=Decimal("20.00"),
            brought_by=self.buyer
        )
        self.other_item.brought_to.add(self.user1)

    def test_collect_item_calculations(self):
        """Test expense calculations"""
        result = collect_item(self.buyer.pk)

        # Test structure
        self.assertIn('items', result)
        self.assertIn('total_expense', result)
        self.assertEqual(len(result['items']), 2)

        # Get items in order
        milk = next(item for item in result['items'] if item['item_name'] == 'Milk')
        lamp = next(item for item in result['items'] if item['item_name'] == 'Lamp')

        # Test Milk calculations (7% tax, split between 2 users)
        self.assertEqual(milk['price'], Decimal("10.00"))
        self.assertEqual(milk['tax_rate'], Decimal("0.07"))
        self.assertEqual(milk['total_with_tax'], Decimal("10.70"))
        
        # Test Lamp calculations (5% tax, single user)
        self.assertEqual(lamp['price'], Decimal("20.00"))
        self.assertEqual(lamp['tax_rate'], Decimal("0.05"))
        self.assertEqual(lamp['total_with_tax'], Decimal("21.00"))

        # Test total expense (10.70 + 21.00)
        self.assertEqual(result['total_expense'], Decimal("31.70"))

    def test_collect_item_user_shares(self):
        """Test user share calculations"""
        result = collect_item(self.buyer.pk)
        
        milk = next(item for item in result['items'] if item['item_name'] == 'Milk')
        lamp = next(item for item in result['items'] if item['item_name'] == 'Lamp')

        # Test user shares for Milk (10.70 / 2 = 5.35 each)
        self.assertEqual(
            milk['user_owned'][self.user1.username]['share'], 
            Decimal("5.35")
        )
        self.assertEqual(
            milk['user_owned'][self.user2.username]['share'], 
            Decimal("5.35")
        )

        # Test user share for Lamp (21.00, single user)
        self.assertEqual(
            lamp['user_owned'][self.user1.username]['share'], 
            Decimal("21.00")
        )

    def test_collect_item_invalid_user(self):
        """Test with invalid user ID"""
        with self.assertRaises(User.DoesNotExist):
            collect_item(999)