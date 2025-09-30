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
    
    
    """
    Collect items brought to the user with primary key `pk` and calculate:
      - per-item total with tax
      - how the item is split (shared count)
      - the user's share for each item
      - aggregated grocery and other totals (user's share)
      - overall total (user's share)

    Returns a dict with:
      - items: list of per-item breakdown dicts
      - grocery_total: Decimal
      - other_total: Decimal
      - total_expense: Decimal

    Notes / assumptions:
      - If List model has a ManyToManyField named `shared_with`, that is used to determine split count.
      - Otherwise, if an item has both `brought_by` and `brought_to` and they are different users, split_count defaults to 2.
      - Otherwise the item is treated as single-person (split_count = 1).
      - Category string "grocery" (case-insensitive) uses 7% tax, all others use 5%.
      - Adjust logic if your model fields differ (e.g. brought_to stored as username string).
    """
    user_owned = {}
    total_price = Decimal("0.00")
    each_owned = Decimal("0.00")
    items = {}


    try:
        user = User.objects.get(pk = pk)
    except user.DoesNotExist:
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

    for item in items_qs:
        
        price = to_decimal(getattr(item, "price", 0))
        category = (getattr(item, "category", "") or "").strip().lower()
        tax_rate = Decimal("0.07") if category == "grocery" else Decimal("0.05")
        total_with_tax = (price *(Decimal("1.00")+ tax_rate)).quantize(Decimal("0.01"), rounding= ROUND_HALF_UP)
        total_price += total_with_tax
        brought_to = getattr(item,"brought_to")
        each_owned = (total_with_tax / len(brought_to)).quantize(Decimal,rounding=ROUND_HALF_UP) 
        for user in brought_to:
          user_owned[user]["share"] = each_owned
          user_owned[user]["category"] = category


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
        "total_expense": total_price
    }

          

        

        

        

            

