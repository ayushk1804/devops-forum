import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { hasuraAdminClient, gql } from "../../../src/lib/hasura-admin-client";

const GetUserByEmail = gql`
  query GetUserByEmail($email: String) {
    users(where: { email: { _eq: $email } }) {
      id
    }
  }
`;

const InsertUser = gql`
  mutation InsertUser($name: String, $email: String, $password: String) {
    insert_users_one(
      object: { name: $name, email: $email, password: $password }
    ) {
      id
      name
      email
    }
  }
`;

export default async (req, res) => {
  const { name, email, password: rawPassword } = req.body;

  const {users:[foundUser],} = await hasuraAdminClient.request(GetUserByEmail, {
    email,
  });

  // 2. If user not found, return error
  if (foundUser) {
    return res.status(400).json({ message: "User with this email already exists!" });
  }
  // 3. Hash the password
  const salt = await bcrypt.genSalt();
  const password = await bcrypt.hash(rawPassword, salt);

  // 4. Create user on Hasura
  const { insert_users_one } = await hasuraAdminClient.request(InsertUser, {
    name,
    email,
    password,
  });

  // 5. Create JWT
  const token = jwt.sign(
    {
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["guest", "user"],
        "x-hasura-default-role": "user",
        "x-hasura-user-id": insert_users_one.id,
      },
    },
    process.env.HASURA_GRAPHQL_JWT_SECRET,
    {
      subject: insert_users_one.id,
    }
  );

  // 6. Return JWT as token + user
  return res.status(201).json({ token, ...insert_users_one });
};
