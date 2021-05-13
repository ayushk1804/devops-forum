import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { hasuraAdminClient, gql } from "../../../src/lib/hasura-admin-client";

const GetUserByEmail = gql`
  query GetUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      name
      password
    }
  }
`;

export default async (req, res) => {
  // 1. Look user from hasura
  const { email, password: rawPassword } = req.body;
  const {
    users: [foundUser],
  } = await hasuraAdminClient.request(GetUserByEmail, {email});

  // 2. If user not found, return error
  if (!foundUser) {
    return res
      .status(401)
      .json({ message: "Email/Password incorrect. Please try again." });
  }

  // 3. Do the password match?
  console.log(foundUser.password)
  const {password:storedPassword, ...user} = foundUser 
  const passwordMatch = await bcrypt.compare(rawPassword, storedPassword);
  if (!passwordMatch) {
    return res
      .status(401)
      .json({ message: "Email/Password incorrect. Please try again." });
  }

  // 4. Create JWT
  const token = jwt.sign(
    {
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["guest", "user"],
        "x-hasura-default-role": "user",
        "x-hasura-user-id": user.id,
      },
    },
    process.env.HASURA_GRAPHQL_JWT_SECRET,
    {
      subject: user.id,
    }
  );

  // 5. Return JWT as token + user
  res.status(200).json({ token, ...user });
};
