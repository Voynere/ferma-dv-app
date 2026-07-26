import * as Products from './functions/products';
import * as Auth from './functions/auth';
import * as Bonus from './functions/bonus';
import * as Delivery from './functions/delivery';
import * as Order from './functions/order';
import * as Images from './functions/images';
import * as Push from './functions/push';

class API {
    public products = Products;
    public auth = Auth;
    public bonus = Bonus;
    public delivery = Delivery;
    public order = Order;
    public images = Images;
    public push = Push;
}

const api = new API();

export default api;