
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
        console.log(body.status)
       
        if(body.dataInicio === ''  && body.cliente === '' && body.status !== '' ){

            if(body.status.length === 0 || body.status.includes('Todos') || body.status.length === 3) {

               
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
            if(body.status[0] !== 'Todos') {
                const filtredContract = await getRepository(Contrato).findAndCount({
                    where:{
                        codrevenda:body.codrevenda,
                        status:body.status[0]
                
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
            if(body.status.length > 1) {
                const ArrayContract = [];
                              
                for (let i = 0; i < body.status.length; i++) {

                    const filtredContract = await getRepository(Contrato).findAndCount({
                        where:{
                            codrevenda:body.codrevenda,
                            status:body.status[i]
                
                        },
                        relations: ['cliente']
                    });  
                                      
                    if(!filtredContract) {
                        return {               
                            error:true,
                            message:'Not Found'
                                      
                        };
                
                    };

                    if(filtredContract){
                        filtredContract[0].map((current:any)=> {
                            return  ArrayContract.push(current);

                        })

                    }
                }   
                return [ArrayContract, ArrayContract.length] 

            }  
        };

        if(body.dataInicio === ''  && body.cliente === '' &&  body.status.length === 0  ){
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

        if(body.cliente === '' && body.status.length === 0 && body.dataInicio !== '' ){
        
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

        if(body.codrevenda === ''  && body.status.length === 0  && body.dataInicio === ''  ){
      
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

                    for (let i = 0; i < body.status.length; i++) {
                        if(!res.includes(callback) && body.status[i].toLowerCase() === callback.status && body.status[i] !== 'Todos'){
                            res.push(callback);
                        }
                        
                                            
                    };

                    if(!res.includes(callback) && body.status.includes('Todos')){
                        res.push(callback);
                    }

                })
                return current;

            })                     
            return [res, res.length] ;
          
        };

        if( body.status.length === 0  && body.dataInicio === ''  ){
      
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

        if( body.dataInicio === ''  ){ // tds menos a data
      
            const cliente = await listClientes({busca:body.cliente}, requester);
            let res = [];
            cliente.map(current => {
                current.contratos.map(callback =>{                    
                    callback.cliente = current;
                    delete callback.cliente.contratos;

                    for (let i = 0; i < body.status.length; i++) {
                        if(!res.includes(callback) && body.status[i].toLowerCase() === callback.status && body.status[i] !== 'Todos' && body.codrevenda === callback.codrevenda.toString()){
                            res.push(callback);
                        }
                                            
                    };

                    if(!res.includes(callback) && body.status.includes('Todos') && body.codrevenda === callback.codrevenda.toString()){
                        res.push(callback);
                    }

                })
                return current;

            })                     
            return [res, res.length] ;
          
        };

        if( body.status.length === 0  && body.codrevenda === '' && body.dataInicio !== '' && body.cliente !== ''){ //data e cliente
      
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
       
        const cliente = await listClientes({busca:body.cliente}, requester);// todos as propriedades do filtro
            let res = [];
            cliente.map(current => {
                current.contratos.map(callback =>{                    
                    callback.cliente = current;
                    delete callback.cliente.contratos;
                    const date = body.dataInicio.split('/')
                    const formatDate =`${date[2]}-${date[1]}-${date[0]}`

                    for (let i = 0; i < body.status.length; i++) {
                        if(!res.includes(callback) && body.status[i].toLowerCase() === callback.status && body.status[i] !== 'Todos' && body.codrevenda === callback.codrevenda.toString() && callback.dataInicio.toString() === formatDate){
                            res.push(callback);
                        }
                                            
                    };

                    if(!res.includes(callback) && body.status.includes('Todos') && body.codrevenda === callback.codrevenda.toString() && callback.dataInicio.toString() === formatDate){
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


