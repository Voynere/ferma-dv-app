import Bread from "./Bread";
import Cake from "./Cake";
import Canning from "./Canning";
import Cetificate from "./Certificate";
import Cheese from "./Cheese";
import Cooking from "./Cooking";
import Discount from "./Discount";
import Eggs from "./Eggs";
import Fish from "./Fish";
import ForBeauty from "./ForBeauty";
import ForHome from "./ForHome";
import Grocery from "./Grocery";
import Honey from "./Honey";
import Jam from "./Jam";
import Meat from "./Meat";
import Milk from "./Milk";
import ReadyEat from "./ReadyEat";
import Sausage from "./Sausage";
import SemiFinished from "./SemiFinished";
import Snacks from "./Snacks";
import StewedMeats from "./StewedMeats";
import Suppliments from "./Suppliments";
import Tea from "./Tea";
import Vegetables from "./Vegetables";

const CtalogIcons: React.FC & {
    Bread: typeof Bread
    Canning: typeof Canning
    Cheese: typeof Cheese
    Cooking: typeof Cooking
    Discount: typeof Discount
    Eggs: typeof Eggs
    Fish: typeof Fish
    Grocery: typeof Grocery
    Honey: typeof Honey
    Jam: typeof Jam
    Meat: typeof Meat
    Milk: typeof Milk
    Sausage: typeof Sausage
    SemiFinished: typeof SemiFinished
    Tea: typeof Tea
    Vegetables: typeof Vegetables
    Suppliments: typeof Suppliments
    ReadyEat: typeof ReadyEat
    Cetificate: typeof Cetificate
    Snacks: typeof Snacks
    ForBeauty: typeof ForBeauty
    StewedMeats: typeof StewedMeats
    ForHome: typeof ForHome
    Cake: typeof Cake
} = () => {
    return null;
};

CtalogIcons.Bread = Bread;
CtalogIcons.Canning = Canning;
CtalogIcons.Cheese = Cheese;
CtalogIcons.Cooking = Cooking;
CtalogIcons.Discount = Discount;
CtalogIcons.Eggs = Eggs;
CtalogIcons.Fish = Fish;
CtalogIcons.Grocery = Grocery;
CtalogIcons.Honey = Honey;
CtalogIcons.Jam = Jam;
CtalogIcons.Meat = Meat;
CtalogIcons.Milk = Milk;
CtalogIcons.Sausage = Sausage;
CtalogIcons.SemiFinished = SemiFinished;
CtalogIcons.Tea = Tea;
CtalogIcons.Vegetables = Vegetables;
CtalogIcons.Suppliments = Suppliments;
CtalogIcons.ReadyEat = ReadyEat
CtalogIcons.Cetificate = Cetificate
CtalogIcons.Snacks = Snacks
CtalogIcons.ForBeauty = ForBeauty
CtalogIcons.StewedMeats = StewedMeats
CtalogIcons.Cake = Cake
CtalogIcons.ForHome = ForHome

export default CtalogIcons;