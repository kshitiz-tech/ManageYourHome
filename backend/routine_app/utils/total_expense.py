from ..models import List, User, Item
from decimal import Decimal



def to_decimal(value):
    return Decimal(str(value or 0)).quantize(Decimal("0.01"))


def collect_item(pk = None, instance = None):
    data  = []
    total_price = Decimal("0.00")
    total_price_without_tax = Decimal("0.00")
    total_tax = Decimal("0.00")
    value_shared = Decimal("0.00")

    if isinstance(instance, Item):
        items_in_list = [instance]
    elif isinstance(instance, List):
        items_in_list = instance.items.all()

    elif pk:
        try:

            user = User.objects.get(pk = pk)
        except User.DoesNotExist:
            raise
        items_in_list = user.brought_by.all()
    
    else:
        items_in_list = []
    
    #for every item 
    for item in items_in_list:
        
        share = {}
        #get the price
        price = to_decimal(getattr(item, "price", 0))
        #get the category of ti
        category = (getattr(item, "category", "") or "").strip().lower()
        if category not in ["groceries", "other"]:
            category = "other"
        if category == "groceries":
            tax_rate = Decimal("0.05")
        else:
            tax_rate = Decimal("0.07")
        item_price = (price * (Decimal("1.00") + tax_rate)).quantize(Decimal("0.01"))
        total_tax += (item_price - price)
        total_price += item_price
        total_price_without_tax += price

        shared_users = item.brought_to.all()
        brought_to_count = shared_users.count()
  
        value_shared = (item_price / Decimal(str(brought_to_count))).quantize(Decimal("0.01"))
        for user in shared_users:
          share[user.username] = share.get(user.username, Decimal("0.00")) + value_shared
    
        data.append({
            "id": getattr(item, "id", None),
            "item_name": getattr(item, "item_name",None),
            "category": category,
            "price": price,
            "tax_rate":tax_rate,
            "item_price": item_price,
            "share": share                
          })
     
    return {
        "item_data": data,
        "total_expense": str(total_price.quantize(Decimal("0.01"))),
        "total_expense_without_tax": str(total_price_without_tax.quantize(Decimal("0.01"))),
        "total_tax": str(total_tax.quantize(Decimal("0.01")))
    }

      


        

        

        

            

