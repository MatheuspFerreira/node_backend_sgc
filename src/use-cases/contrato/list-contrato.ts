import { FindManyOptions, getRepository } from 'typeorm';
import IListContracts from './interfaces/list-contrato';
import { Contrato } from '../../database/entities';
import validator from './validators/list-contrato';
import {
  podeConsultarClientes,
  useCodigoRevenda,
} from '../../lib/authorizations';

export default async function listContract({
  limitPerPage,
  page,
  requester,
  codcliente,
}: IListContracts) {
  await validator({
    limitPerPage,
    page,
  });

  await podeConsultarClientes(requester);

  const codrevenda = useCodigoRevenda(requester);

  const query: FindManyOptions = {
    skip: Number(page) * Number(limitPerPage),
    take: Number(limitPerPage),
    order: { createdAt: 'DESC' },
    relations: ['cliente'],
  };

  if (codrevenda) {
    query.where = { codrevenda };
  }

  if (codcliente) {
    query.where = { cliente: { codcliente: Number(codcliente) } };
  }

  return getRepository(Contrato).findAndCount(query);
}
