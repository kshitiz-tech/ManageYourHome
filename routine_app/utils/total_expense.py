from ..models import List, User
from decimal import Decimal, ROUND_HALF_UP


#three views:
'''
-> basic view: 
  -> all items listed if user brought it : ( items.brought_by == user)
    -> for each item in all items:
      -> base_price = item.price
      -> category = {grocery, other}
      -> if category == grocery:
        -> tax = base_price * 0.05
      -> else:
        -> tax = base_price * 0.07
      -> item_price  = tax + base_price
      -> total_tax +-= tax
      -> total_price += item_price
      -> brought_to = [ user1, user2, user3]
      -> each_owned = item_price/len(brought_to)
      user_owned = {}
      -> for user in brought_to:
        -> user_owned[user] = each_owned

      
    




'''
#collect the items from the List of the user
def to_decimal(value):
    return Decimal(str(value or 0)).quantize(Decimal("0.01"), rounding = ROUND_HALF_UP)
def collect_item(pk):
    
    
    user_owned = {}
    total_price = Decimal("0.00")
    each_owned = Decimal("0.00")
    items = []

    try:
        user = User.objects.get(pk = pk)
    except User.DoesNotExist:
        raise
    

    #try related_name to extract items 
    try: 
        items_qs = user.brought_by.all()
    
    except Exception:
        #if not by related_name,try by foreign key
        try: 
            field = List._meta.get_field("brought_by")
            if getattr(field, "is_relation", False):
                items_qs = List.objects.filter(brought_by = user) #by foregin key
            else:
                items_qs = List.objects.filter(brought_by = user.username) #by username strin
        except Exception:
            raise

    #for every item 
    for item in items_qs:
        
        #get the price
        price = to_decimal(getattr(item, "price", 0))
        #get the category of ti
        category = (getattr(item, "category", "") or "").strip().lower()
        tax_rate = Decimal("0.07") if category == "grocery" else Decimal("0.05")
        total_with_tax = (price *(Decimal("1.00")+ tax_rate)).quantize(Decimal("0.01"), rounding= ROUND_HALF_UP)
        total_price += total_with_tax

        brought_to_count = item.brought_to.count()
  
        each_owned = (total_with_tax / Decimal(str(brought_to_count))).quantize(Decimal(),rounding=ROUND_HALF_UP) 
        for user in item.brought_to.all():
          user_owned[user.username] = {
              "share": each_owned,
              "category": category
          }


        items.append({
            "id": getattr(item, "id", None),
            "item_name": getattr(item, "item_name",None),
            "category": category,
            "price": price,
            "tax_rate":tax_rate,
            "total_with_tax": total_with_tax,
            "user_owned": user_owned
                
          })
     
    return {
        "items": items,
        "total_expense": total_price.quantize(Decimal("0.01"), rounding = ROUND_HALF_UP)
    }

      


        

        

        

            

