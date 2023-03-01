import dotenv from 'dotenv';

import { inquirerMenu, leerInput, listarLugares, pausa } from "./helpers/Inquirer.js";
import { Busquedas } from "./models/busquedas.js";

dotenv.config();
console.clear();
const main = async()=>{

    //instancia de clase

    const busquedas =  new Busquedas();

    
    let opt = '';

    do{
        opt = await inquirerMenu();

        switch (opt) {
            case '1':
                //Mostrar mensaje
                const termino = await leerInput('ciudad');
                
                //Buscar lugar
                const lugares = await busquedas.ciudad( termino );
                
                //seleccionar lugar
                const id = await listarLugares(lugares);

                if (id === '0') continue;
                const lugarSeleccionado = lugares.find( lugar => lugar.id === id );

                //Guardar en DB
                busquedas.agregarHistorial(lugarSeleccionado.nombre);
                
                //mostrar datos de clima

                const clima = await busquedas.climaLugar(lugarSeleccionado.lat,lugarSeleccionado.lng);

                //Mostrar resultados
                console.clear();
                console.log('\nInformacion de la ciudad\n'.green);
                console.log('Ciudad: ', lugarSeleccionado.nombre);
                console.log('Latitud: ', lugarSeleccionado.lat);
                console.log('Longitud: ', lugarSeleccionado.lng);
                console.log('Temperatura: ',clima.temp );
                console.log('Minima: ', clima.min);
                console.log('Maxima: ', clima.max);
                console.log('como esta el clima:', clima.desc);

                break;


            case '2':

                busquedas.historialCapitalizado.forEach((lugar,i) => {
                    const idx = `${i+1}.`.green;
                    console.log(`${idx} ${lugar}`);
                });

                break;
        
            default:
                break;
        }

        if(opt!=='0') await pausa()
    }while(opt!=='0');



    
    
}


main();