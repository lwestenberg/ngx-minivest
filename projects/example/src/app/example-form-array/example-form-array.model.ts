export type FormArrayModel = {
  // Input field for adding new interest
  addInterest: string;
  // Object with numeric keys representing array indices
  interests: { [key: string]: string };
};
