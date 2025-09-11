from ..models import List, User


def each_expense():
    items  = List.objects.all()
    print(items)

