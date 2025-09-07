export interface UserModel {
  _id: number;
  name: string;
  email: string;
  password: string;
}
export interface SignupInterface {
  name: string;
  email: string;
  password: string;
}
export interface LoginInterface {
  email: string;
  password: string;
}
