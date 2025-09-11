from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User



''' Core Compartment of Database '''

'''This model provides all the necessary fields for the list, i.e, items brought by the users
 for other member of the household

'''
class List(models.Model):

    #defining category for choices used in category field
    class Category(models.TextChoices):
        GROCERIES = "groceries", "Groceries"
        Other = "other", "Other"
    item_name = models.CharField(max_length= 100)
    category = models.CharField(max_length= 10,
                                choices= Category.choices,
                                blank = False,
                                null= False)
    price = models.DecimalField(null= False, blank= False, decimal_places= 2, max_digits= 10000)
    brought_by =  models.ForeignKey(User, related_name= 'brought_by', on_delete= models.CASCADE )
    brought_to = models.ManyToManyField(User,related_name="brought_to_you", blank= False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.item_name


