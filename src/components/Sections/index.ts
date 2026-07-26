import * as Home from "./Home";
import * as Catalog from "./Catalog";
import * as Delivery from "./Delivery";
import * as Profile from "./Profile";
import * as Product from "./Product";
import * as Cart from "./Cart";
import * as Favorite from "./Favorite";
import * as Checkout from "./Checkout";
import Discounts from "./Discounts";
import Contacts from "./Contacts";

const Sections: React.FC & {
    Home: typeof Home
    Catalog: typeof Catalog
    Delivery: typeof Delivery
    Profile: typeof Profile
    Product: typeof Product
    Discounts: typeof Discounts
    Contacts: typeof Contacts
    Checkout: typeof Checkout
    Cart: typeof Cart
    Favorite: typeof Favorite
} = () => {
    return null;
};

Sections.Home = Home;
Sections.Catalog = Catalog;
Sections.Delivery = Delivery
Sections.Profile = Profile;
Sections.Product = Product;
Sections.Discounts = Discounts;
Sections.Contacts = Contacts;
Sections.Cart = Cart
Sections.Checkout = Checkout
Sections.Favorite = Favorite

export default Sections;