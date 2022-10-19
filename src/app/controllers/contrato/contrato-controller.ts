import { Response } from 'express';
import RequestCustom from '../../../lib/types/RequestCustom';
import listContracts from '../../../use-cases/contrato/list-contrato';
import obtainContract from '../../../use-cases/contrato/obtain-contrato';
import storeContract from '../../../use-cases/contrato/store-contrato';
import destroyContract from '../../../use-cases/contrato/destroy-contrato';
import canStoreContract from '../../../use-cases/contrato/can-store-contrato';
import checkSufixoContrato from '../../../use-cases/contrato/check-sufixo-contrato';

export default {
  async list({ query, user: requester }: RequestCustom, res: Response) {
    const contratos = await listContracts({
      limitPerPage: query.limitPerPage as unknown as number,
      page: query.page as unknown as number,
      codcliente: query.codcliente as unknown as number,
      requester,
    });

    return res.status(200).json(contratos);
  },

  async obtain({ params, user: requester }: RequestCustom, res: Response) {
    const contrato = await obtainContract(parseInt(params.id, 10), requester);

    return res.status(200).json(contrato);
  },

  async destroy({ params, user: requester }: RequestCustom, res: Response) {
    await destroyContract(parseInt(params.id, 10), requester);

    return res.status(204).send();
  },

  async canStore({ body, user: requester }: RequestCustom, res: Response) {
    const cliente = await canStoreContract({
      cnpj: body.cnpj.replace(/[^\w\s]/g, ''),
      tipoDoc: body.tipoDoc,
      requester,
    });

    return res.status(200).json(cliente);
  },

  async store({ body, user: requester }: RequestCustom, res: Response) {
    const contract = await storeContract(body, requester);
    return res.status(201).json(contract);
  },

  async checkSufixo({ body }: RequestCustom, res: Response) {
    
    const validaSufixo = await checkSufixoContrato({
      sufixo: body.sufixo.toLowerCase(),
    });

    return res.status(200).send(validaSufixo);
  },
};
