# ManageYourHome AI Development Guide

## Project Overview
ManageYourHome is a Django-based household management system that tracks shared expenses and items between household members. The project uses Django REST framework for API endpoints and follows specific patterns for expense calculations and user interactions.

## Key Architecture Components

### Data Model
- Primary model `List` in `routine_app/models.py` represents household items with:
  - Category classification (Groceries/Other)
  - Price tracking with decimal precision
  - User relationships (brought_by/brought_to) for expense sharing
  - Timestamp tracking

### API Structure
- RESTful endpoints in `routine_app/views.py` follow these patterns:
  - Class-based views extending Django REST Framework generics
  - Permission-based access control (IsAuthenticated for most endpoints)
  - Separate views for creation (`CreateList`) and management (`Lists_Details`)

### Business Logic
- Expense calculations (`routine_app/utils/total_expense.py`):
  - Tax rates: 5% for groceries, 7% for other items
  - Precise decimal handling using `Decimal` with ROUND_HALF_UP
  - Per-user share calculation based on item participants

## Development Patterns

### Data Handling
```python
# Always use to_decimal for price calculations
from decimal import Decimal, ROUND_HALF_UP
amount = to_decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
```

### Error Handling
```python
# Follow this pattern for API error responses
try:
    # Business logic
    return Response(data=result, status=status.HTTP_200_OK)
except User.DoesNotExist:
    return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
except Exception as e:
    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

## Testing and Development
1. Ensure Django and DRF are installed
2. Run migrations: `python manage.py migrate`
3. Create a superuser: `python manage.py createsuperuser`
4. Run development server: `python manage.py runserver`

## Common Integration Points
- Authentication: Uses Django's built-in User model
- API Endpoints: All routes require authentication except user creation
- Database: SQLite for development (configured in settings.py)

## Project Structure Conventions
- Business logic goes in `routine_app/utils/`
- Model definitions in `routine_app/models.py`
- API views in `routine_app/views.py`
- URL routing in `routine_app/urls.py`