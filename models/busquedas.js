import fs from "fs";

import axios from "axios";

class Busquedas {

    historial = [];

    dbPath = './db/database.json';

    constructor(){
        //TODO LEER DE BD SI EXISTE
        this.leerDB();

    }

    get paramsMapBox(){
        return{
            'proximity':'ip',
            'language':'es',
            'access_token': process.env.MAPBOX_KEY
        }
    }

    get paramsOpenWeather(){
        return{
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }

    }

    get historialCapitalizado(){
        return this.historial.map(lugar=>{

            let palabra = lugar.split(' ');
            palabra = palabra.map(p=>p[0].toUpperCase()+p.substring(1) );

            return palabra.join(' ');
            
        })
    }

    async ciudad(lugar = ''){

        try {
            //peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places`,
                params:this.paramsMapBox
            });

            const resp = await instance.get(`${ lugar }.json`);
            // const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/Madrid.json?proximity=ip&language=es&access_token=pk.eyJ1Ijoic2FudGlhZ29jZyIsImEiOiJjbGRqNG05MnowMGRzM3BxbWhteWlmaDdsIn0.TCWNFmhjJuLWxwhYfkY-Jw');
            return resp.data.features.map( lugar =>({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],

            }));
        } catch (error) {
            return [];
        }

         
    }

    async climaLugar(lat, lon){
        try {
            // instancia de axios
            const instanciaClima = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params:{...this.paramsOpenWeather,lat,lon}
            });

            // respuesta de la data
            const resp = await instanciaClima.get();
            const {weather,main } = resp.data;

            return {
               desc: weather[0].description,
               min: main.temp_min,
               max: main.temp_max,
               temp: main.temp 
            };
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial(lugar = ''){
        //TODO prevenir duplicados
        if(this.historial.includes(lugar.toLocaleLowerCase())){
            return;
        }

        //limite de historial

        this.historial = this.historial.splice(0,5);

        this.historial.unshift(lugar.toLocaleLowerCase());
        //Grabar en DB
        this.grabarDB();

    }

    grabarDB(){
        console.log('grabando');
        const payload ={
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){

        //verificar si existe
        if (!fs.existsSync(this.dbPath)) {
            return null;
        }
        //cargar informacion
        const info = fs.readFileSync(this.dbPath,{encoding:'utf-8'});

        const data = JSON.parse(info);
        this.historial = data.historial;
        console.log(this.historial);
        return data;
        

    }
}


export { Busquedas };