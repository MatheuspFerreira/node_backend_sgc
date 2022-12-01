
import { Contrato } from '../../database/entities';
import IRequester from '../../lib/interfaces/requester';
import { getRepository } from 'typeorm';
import listClientes from '../cliente/list-cliente';


export default async function filterAtendente(
  body: any,
  requester: IRequester,

) {

    if(requester.p.toString() !== '**'){
        return {
            error:true,
            message:'Você não possui permissão para realizar essa operação!'
        };
    };

    try {
       
        if(body.dataInicio === ''  && body.cliente === '' && body.status !== ''  ){
        
           
            const filtredContract = await getRepository(Contrato).findAndCount({
                where:{
                    codrevenda:body.codrevenda,
                    status:body.status
        
                },
                relations: ['cliente']
            });
          
            if(!filtredContract) {
                return {               
                    error:true,
                    message:'Not Found'
                              
                };
        
            };
           
            return filtredContract;
            
        };

        if(body.dataInicio === ''  && body.cliente === '' &&  body.status === ''  ){
            const filtredContract = await getRepository(Contrato).findAndCount({
                where:{
                    codrevenda:body.codrevenda,
        
                },
                relations: ['cliente']
            });
          
            if(!filtredContract) {
                return {               
                    error:true,
                    message:'Not Found'
                              
                };
        
            };
           
            return filtredContract;
            
        };

        const parts = body.dataInicio.split('/')
        const formatDate = new  Date(parts[2], parts[1] - 1, parts[0])
        
        if(body.cliente === '' && body.status !== ''){
        
            const filtredContract = await getRepository(Contrato).findAndCount({
            
                where:{
                    codrevenda:body.codrevenda,
                    status:body.status,
                    dataInicio:formatDate,
                    
                },
                relations: ['cliente']
                
            });
          
            if(!filtredContract) {
                return {               
                    error:true,
                    message:'Not Found'
                              
                };
        
            };
           
            return filtredContract;
  
        };

        if(body.cliente === '' && body.status === '' && body.dataInicio !== '' ){
        
            const filtredContract = await getRepository(Contrato).findAndCount({
            
                where:{
                    codrevenda:body.codrevenda,
                    dataInicio:formatDate,
                    
                },
                relations: ['cliente']
                
            });
          
            if(!filtredContract) {
                return {               
                    error:true,
                    message:'Not Found'
                              
                };
        
            };
           
            return filtredContract;
  
        };

        if(body.codrevenda === ''  && body.status === ''  && body.dataInicio === ''  ){
      
            const cliente = await listClientes({busca:body.cliente}, requester);
            let res = [];
            cliente.map(current => {
                current.contratos.map(callback =>{                    
                    callback.cliente = current;
                    delete callback.cliente.contratos;

                    if(!res.includes(callback)){
                        res.push(callback);
                    }
                    return ;

                })
                return current;

            })                     
            return [res, res.length] ;
          
        };

        if(body.codrevenda === ''  && body.dataInicio === ''  ){
      
            const cliente = await listClientes({busca:body.cliente}, requester);
            let res = [];
            cliente.map(current => {
                current.contratos.map(callback =>{                    
                    callback.cliente = current;
                    delete callback.cliente.contratos;

                    if(!res.includes(callback) && body.status === callback.status){
                        res.push(callback);
                    }
                    return ;

                })
                return current;

            })                     
            return [res, res.length] ;
          
        };

        if( body.status === ''  && body.dataInicio === ''  ){
      
            const cliente = await listClientes({busca:body.cliente}, requester);
            let res = [];
            cliente.map(current => {
                current.contratos.map(callback =>{                    
                    callback.cliente = current;
                    delete callback.cliente.contratos;

                    if(!res.includes(callback) && body.codrevenda === callback.codrevenda.toString()){
                        res.push(callback);
                    }
                    return ;

                })
                return current;

            })                     
            return [res, res.length] ;
          
        };

        if( body.dataInicio === ''  ){
      
            const cliente = await listClientes({busca:body.cliente}, requester);
            let res = [];
            cliente.map(current => {
                current.contratos.map(callback =>{                    
                    callback.cliente = current;
                    delete callback.cliente.contratos;

                    if(!res.includes(callback) && body.codrevenda === callback.codrevenda.toString() && body.status === callback.status){
                        res.push(callback);
                    }
                    return ;

                })
                return current;

            })                     
            return [res, res.length] ;
          
        };

        if( body.status === ''  && body.codrevenda === '' && body.dataInicio !== '' && body.cliente !== ''){
      
            const cliente = await listClientes({busca:body.cliente}, requester);
            let res = [];
            cliente.map(current => {
                current.contratos.map(callback =>{                    
                    callback.cliente = current;
                    delete callback.cliente.contratos;
                    const date = body.dataInicio.split('/')
                    const formatDate =`${date[2]}-${date[1]}-${date[0]}`
                    if(!res.includes(callback) 
                        && callback.dataInicio.toString() === formatDate
                    ){
                        res.push(callback);
                    }
                    return ;

                })
                return current;

            })                     
        return [res, res.length] ;
          
        };
       
        const cliente = await listClientes({busca:body.cliente}, requester);
            let res = [];
            cliente.map(current => {
                current.contratos.map(callback =>{                    
                    callback.cliente = current;
                    delete callback.cliente.contratos;
                    const date = body.dataInicio.split('/')
                    const formatDate =`${date[2]}-${date[1]}-${date[0]}`
                    if(!res.includes(callback) 
                        && body.status === callback.status 
                        && body.codrevenda === callback.codrevenda.toString() 
                        && callback.dataInicio.toString() === formatDate
                    ){
                        res.push(callback);
                    }
                    return ;

                })
                return current;

            })                     
        return [res, res.length] ;

    } catch (error) {
        return {              
            error:true,
            message:error
                 
        };
        
    };

}


