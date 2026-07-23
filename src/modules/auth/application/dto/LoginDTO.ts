export type LoginInputDTO = {
  email: string;
  password: string;
};

export type LoginOutputDTO = {
  userId: string;
  email: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
};
