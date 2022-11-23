import { format } from 'date-fns';
import { NotFound as NotFoundError } from 'http-errors';
import { getConnection, getRepository } from 'typeorm';

import { Contrato, Produto, Cliente } from '../../database/entities';
import validator from './validators/store-contrato';

import ICreateContract from './interfaces/store-contrato';
import IRequester from '../../lib/interfaces/requester';
import { podeLicenciarClientes } from '../../lib/authorizations';
import hasActiveContracts from './business-rules/has-active-contracts';

export default async function store(
  contractData: ICreateContract,
  requester: IRequester
) {
  await validator(contractData);
  await podeLicenciarClientes(requester);

  if(requester.p.toString() === '**'){

   const cliente =  await getRepository(Cliente).findOne({
      order: {
        fantasia: 'ASC',
      },
      where: {
        codcliente: contractData.codcliente,
      },
      relations: ['contratos', 'contratos.contrato'],
    })

   const produto =  await getRepository(Produto).findOne({ codproduto: contractData.codproduto })

   if (!cliente) {
      throw new NotFoundError('Cliente não encontrado');
    }

    if (!produto) {
      throw new NotFoundError('Produto não encontrado');
    }

  const contrato =  new Contrato();
  contrato.dataInicio = format(
      new Date(contractData.dataInicio),
      'yyyy-MM-dd'
  ) as unknown as Date;
  contrato.sufixo = contractData.sufixo;
  contrato.codproduto = contractData.codproduto;
  contrato.codrevenda = requester.id;
  contrato.versao = contractData.versao;
  contrato.campanha = contractData.campanha;
  contrato.adminEmail = contractData.adminEmail;
  contrato.cliente = cliente;

  if (contractData.contratoid) {
    contrato.contrato = await getRepository(Contrato).findOne({
      id: contractData.contratoid,
    });
  }

  await getConnection().manager.save(contrato, { reload: true });

  return contrato;


  }

  // @todo: validar cliente, produto e revenda
  // Cliente: Checar se existe e não possui contrato ativo
  // Produto: Checar se existe
  // Revenda: Checar se existe
  const [cliente, produto] = await Promise.all([
    getRepository(Cliente).findOne({
      order: {
        fantasia: 'ASC',
      },
      where: {
        codcliente: contractData.codcliente,
      },
      relations: ['contratos', 'contratos.contrato'],
    }),
    getRepository(Produto).findOne({ codproduto: contractData.codproduto }),
    // getRepository(Revenda).findOne({ codrevenda: contractData.codrevenda }),
  ]);
  
  await hasActiveContracts(cliente, requester.id);

    if (!cliente) {
      throw new NotFoundError('Cliente não encontrado');
    }

    if (!produto) {
      throw new NotFoundError('Produto não encontrado');
    }

  const contrato = new Contrato();
  contrato.dataInicio = format(
    new Date(contractData.dataInicio),
    'yyyy-MM-dd'
  ) as unknown as Date;
  contrato.sufixo = contractData.sufixo;
  contrato.codproduto = contractData.codproduto;
  contrato.codrevenda = requester.id;
  contrato.versao = contractData.versao;
  contrato.campanha = contractData.campanha;
  contrato.adminEmail = contractData.adminEmail;
  contrato.cliente = cliente;

  if (contractData.contratoid) {
    contrato.contrato = await getRepository(Contrato).findOne({
      id: contractData.contratoid,
    });
  }

  await getConnection().manager.save(contrato, { reload: true });

  return contrato;
}
