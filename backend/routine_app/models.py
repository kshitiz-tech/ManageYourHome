from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User



''' Core Compartment of Database '''

'''This model provides all the necessary fields for the list, i.e, items brought by the users
 for other member of the household

'''
class List(models.Model):

    #defining category for choices used in category field
    list_name = models.CharField(max_length= 100, default= f"List created on {timezone.now().date()}")
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, related_name='lists', on_delete=models.CASCADE)


    def __str__(self):
        return self.list_name

class Item(models.Model):
    class Category(models.TextChoices):
        GROCERIES = "groceries", "Groceries"
        Other = "other", "Other"
    item_name = models.CharField(max_length= 100)
    category = models.CharField(max_length= 10,
                                choices= Category.choices,
                                blank = False,
                                null= False)
    

    list = models.ForeignKey(List, related_name= 'items', on_delete= models.CASCADE)
    price = models.DecimalField(null= False, blank= False, decimal_places= 2, max_digits= 1000)
    #foreign key to User model and related name for reverse lookup
    brought_by = models.ForeignKey(User, related_name= 'brought_by', on_delete= models.CASCADE )
    brought_to = models.ManyToManyField(User,related_name="brought_to", blank= False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.item_name} - {self.category} - {self.price}'
    
