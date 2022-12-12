import { format } from 'date-fns';
import { NotFound as NotFoundError } from 'http-errors';
import { Any, getConnection, getRepository } from 'typeorm';
import { Contrato, Produto, Cliente, Revenda, Atendente } from '../../database/entities';
import validator from './validators/store-contrato';
import ICreateContract from './interfaces/store-contrato';
import IRequester from '../../lib/interfaces/requester';
import { podeLicenciarClientes } from '../../lib/authorizations';
import hasActiveContracts from './business-rules/has-active-contracts';
import CreateContractApi from '../../lib/api/create-contract';



export default async function store(
  contractData: any,// criar type. Type antigo ICreateContract
  requester: IRequester
) {
  await validator(contractData);
  await podeLicenciarClientes(requester);
  //console.log(contractData)

  if(requester.p.toString() === '**'){

   try {
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
      
      const revenda = await getRepository(Revenda).findOne({
        codrevenda: contractData.revenda.id

      });

      const contrato =  new Contrato();
      contrato.dataInicio = format(
          new Date(contractData.dataInicio),
          'yyyy-MM-dd'
      ) as unknown as Date;
      contrato.sufixo = contractData.sufixo;
      contrato.codproduto = contractData.codproduto;
      contrato.codrevenda = contractData.revenda.id;
      contrato.versao = contractData.versao;
      contrato.campanha = contractData.campanha;
      contrato.adminEmail = contractData.adminEmail;
      contrato.cliente = cliente;
      contrato.id_ifitness_web = 0;

      if (contractData.contratoid) {
        contrato.contrato = await getRepository(Contrato).findOne({
          id: contractData.contratoid,
        });

      };

      const saveContract = await getConnection().manager.save(contrato, { reload: true });
        if(!saveContract){ 
          return {
            error:true,
            message:'Erro ao criar o contrato'
          };
          
        };
        
        if(saveContract.status === 'ativo'){
          saveContract.status = 'T' as any;
  
        };
        //console.log(saveContract.cliente.razaosocial)
        //console.log(saveContract.cliente)
        
      const createInExternalApi= await CreateContractApi(
        {
          nome: revenda.razaosocial,
          prefixo: saveContract.sufixo,
          id_revenda: revenda.codrevenda,
          cnpj_revenda: revenda.cnpj,
          razao_social_revenda: revenda.razaosocial,
          unidades: [
            {
              nome: saveContract.cliente.razaosocial,
              nome_fantasia: saveContract.cliente.fantasia,
              razao_social: saveContract.cliente.razaosocial,
              telefone_comercial: '',
              endereco: saveContract.cliente.endereco,
              numero: '',// não tem no cadastro
              complemento: '',// não tem no cadastro
              bairro: saveContract.cliente.bairro,
              cidade: saveContract.cliente.cidade,
              uf: saveContract.cliente.uf,
              ativo: saveContract.status,
              responsavel1: saveContract.cliente.razaosocial,
              cnpj_cpf:saveContract.cliente.cnpj
            }
          ]
        }
  
      ) as any

      //console.log(createInExternalApi)
      if(createInExternalApi.error || createInExternalApi.result !== true){
        return createInExternalApi;
        
      };
     
      saveContract.status = 'ativo';
      contrato.id_ifitness_web = createInExternalApi.cod_contrato;
      const newContract = await getConnection().manager.save(contrato, { reload: true });
 
      return newContract;
    
    } catch (error) {

      return {
        error:true,
        message:error
      };  
    };


  };

  // @todo: validar cliente, produto e revenda
  // Cliente: Checar se existe e não possui contrato ativo
  // Produto: Checar se existe
  // Revenda: Checar se existe
  try {
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
    contrato.id_ifitness_web = 0;
  
    if (contractData.contratoid) {
      contrato.contrato = await getRepository(Contrato).findOne({
        id: contractData.contratoid,
      });
    }
    const revenda = await getRepository(Revenda).findOne({
      codrevenda: requester.id,
    });

    //console.log(revenda)
    const saveContract = await getConnection().manager.save(contrato, { reload: true });
      if(!saveContract){ 
        return {
          error:true,
          message:'Erro ao criar o contrato'
        };
        
      };
    
      if(saveContract.status === 'ativo'){
        saveContract.status = 'T' as any;

      }
    const createInExternalApi= await CreateContractApi(
      {
        nome: revenda.razaosocial,
        prefixo: saveContract.sufixo,
        id_revenda: revenda.codrevenda,
        cnpj_revenda: revenda.cnpj,
        razao_social_revenda: revenda.razaosocial,
        unidades: [
          {
            nome: saveContract.cliente.razaosocial,
            nome_fantasia: saveContract.cliente.fantasia,
            razao_social: saveContract.cliente.razaosocial,
            telefone_comercial: '',
            endereco: saveContract.cliente.endereco,
            numero: '',// não tem no cadastro
            complemento: '',// não tem no cadastro
            bairro: saveContract.cliente.bairro,
            cidade: saveContract.cliente.cidade,
            uf: saveContract.cliente.uf,
            ativo: saveContract.status,
            responsavel1: saveContract.cliente.razaosocial,
            cnpj_cpf:saveContract.cliente.cnpj
          }
        ]
      }

    ) as any

    //console.log(createInExternalApi.result, createInExternalApi.msg)
    if(createInExternalApi.error || createInExternalApi.result !== true){
      //console.log(createInExternalApi)
      return createInExternalApi;
      
    };

    saveContract.status = 'ativo';
    contrato.id_ifitness_web = createInExternalApi.cod_contrato;
    const newContract = await getConnection().manager.save(contrato, { reload: true });
    

    
  
    return newContract;

  } catch (error) {
    return {
      error:true,
      message:error
    };  
    
  }
}
