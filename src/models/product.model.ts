import { Model, DataTypes, UUIDV4 } from "sequelize";
import db from "../configs/database.config";
import Store from "./store.model";

export interface IProductModel {
  idProduct?: String;
  idStore: string;
  nameProduct: string;
  price: Number;
}

class Product extends Model<IProductModel> {}

Product.init(
  {
    idProduct: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: UUIDV4(),
    },
    idStore: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameProduct: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    timestamps: false,
    tableName: "Products",
    freezeTableName: true,
  }
);

Product.removeAttribute("id");
Store.hasOne(Product, { foreignKey: "idStore" });
Product.belongsTo(Store, { as: "store", foreignKey: "idStore" });
export default Product;
