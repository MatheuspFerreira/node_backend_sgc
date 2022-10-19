import { Request, Response } from 'express';
import createLogin from '../../../use-cases/auth/create-login';
import verify from '../../../use-cases/auth/verify';

export default {
  async login({ body }: Request, res: Response) {
    const loginData = await createLogin({
      email: body.email,
      password: body.password,
    });

    return res.status(200).json(loginData);
  },

  async verify({ query }: Request, res: Response) {
    await verify({
      token: query.at,
    });

    return res.status(204).send();
  },
};
