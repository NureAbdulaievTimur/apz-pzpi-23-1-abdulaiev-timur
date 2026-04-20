# 
# Підсистеми
# 

class InventorySystem:
    def update_stock(self, item):
        print(f"Decreased stock for {item}")

class PaymentSystem:
    def charge_card(self, user, amount):
        print(f"Charged {user} ${amount}")

class ShippingSystem:
    def schedule_delivery(self, user, item):
        print(f"Delivery scheduled for {user} with item: {item}")


#
# 1. Реалізація без патерну
#

class LegacyClientApp:
    """
    Клієнтський код (наприклад, обробник інтерфейсу користувача).
    Проблема: Клієнт змушений знати про всі бекенд-сервіси, 
    їхні класи та правильний порядок виклику методів.
    """
    def process_checkout(self, user, item, price):
        print("Starting Order Process")
        
        # Клієнт власноруч створює і керує підсистемами
        inventory = InventorySystem()
        payment = PaymentSystem()
        shipping = ShippingSystem()

        # Клієнт контролює бізнес-логіку
        inventory.update_stock(item)
        payment.charge_card(user, price)
        shipping.schedule_delivery(user, item)
        
        print("Order Complete")


#
# 2. Реалізація з патерном
#

class CheckoutFacade:
    """
    Фасад бере на себе відповідальність за взаємодію з підсистемами.
    Він приховує складність та надає єдиний простий метод для клієнта.
    """
    def __init__(self):
        self._inventory = InventorySystem()
        self._payment = PaymentSystem()
        self._shipping = ShippingSystem()

    def place_order(self, user, item, price):
        print("Starting Order Process")
        # Інкапсуляція правильної послідовності алгоритму
        self._inventory.update_stock(item)
        self._payment.charge_card(user, price)
        self._shipping.schedule_delivery(user, item)
        print("Order Complete")


#
# 3. Демонстрація
#

if __name__ == "__main__":
    
    # Варіант 1: Клієнт виконує все самостійно (Складно та заплутано)
    legacy_app = LegacyClientApp()
    legacy_app.process_checkout("Alice", "Laptop", 1200)

    print("\n\n")

    # Варіант 2: Використання Фасаду (Чистий та простий клієнтський код)
    # Клієнт не створює об'єкти підсистем і взагалі не знає про їхнє існування
    facade = CheckoutFacade()
    facade.place_order("Alice", "Laptop", 1200)