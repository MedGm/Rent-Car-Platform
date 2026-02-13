from app import create_app, db
from app.models import User, Car, Booking, CalendarBlock, Contract

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Car': Car, 'Booking': Booking, 'CalendarBlock': CalendarBlock, 'Contract': Contract}

if __name__ == '__main__':
    app.run(debug=True)
