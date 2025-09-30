from django.test import TestCase
from django.contrib.auth.models import User
from .models import List
from routine_app.utils.total_expense import each_expense

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


class EachExpenseTest(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword' )
        self.user = User.objects.create_user(username='testuser2', password = 'testpass2')


        List.objects.create(item_name = 'Item 1',category = "Groceries" , price = 6.0, brought_to = ["testuser"], brought_by = "user1")
        List.objects.create(item_name = 'Item 2', category = "Others", price = 7.0, brought_to = ["testuser", "user1"] ,brought_by = "user2")
        List.objects.create(item_name = "Item 3", category = "Groceries", price = 8.0, brought_to = ["testuser2", "user2"], brought_by = "user3")

    def test_each_expense(self):
        each_expense(self.user.pk)

        items = List.objects.filter(brought_to = self.user.username)

        self.assertEqual(items.count(), 2)
        self.assertEqual(items[0].item_name, "Item 1")
        self.assertEqual(items[1].item_name, "Item 2")
        self.assertEqual(items[0].brought_to.count(), 1)
        self.assertEqual(items[1].brought_to.count(), 2)



