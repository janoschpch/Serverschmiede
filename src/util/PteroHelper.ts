import axios from "axios";

require('dotenv').config();

const Logger = require('./Logger');

const eggData = require('../../config/egg_data.json');

export var eggs: any = [];
export var allocations: any = [];

function updateData() {
    axios.get(process.env.PTERODACTYL_BASE_URL + '/api/application/nests/' + process.env.PTERODACTYL_NEST_ID + '/eggs?include=variables', {
        headers: {
            'Authorization': 'Bearer ' + process.env.PTERODACTYL_API_KEY as string
        }
    }).then(function (response) {
        eggs = response.data.data;
        Logger.info('Pterodactyl eggs retrieved');
    });
    
    axios.get(process.env.PTERODACTYL_BASE_URL + '/api/application/nodes/' + process.env.PTERODACTYL_NODE_ID + '/allocations', {
        headers: {
            'Authorization': 'Bearer ' + process.env.PTERODACTYL_API_KEY as string
        }
    }).then(function (response) {
        allocations = response.data.data;
        Logger.info('Pterodactyl allocations retrieved');
    });
}

updateData();

export async function createServer(name: string, user: number, egg: number, callback: CallableFunction) {
    var eggData = getEggById(egg);
    var allocationData = getUnassignedAllocation();
    var limits = getLimitsByEggId(egg);

    var serverConfig = {
        name: name,
        user: user,
        egg: egg,
        docker_image: eggData.attributes.docker_image,
        startup: getEggById(egg).attributes.startup,
        environment: {},
        limits: limits,
        feature_limits: {
            databases: 0,
            backups: 1,
        },
        allocation: {
            default: allocationData.attributes.id
        }
    }

    console.log(serverConfig);

    eggData.attributes.relationships.variables.data.forEach((element: any) => {
        // @ts-ignore
        serverConfig.environment[element.attributes.env_variable] = element.attributes.default_value;
    });

    axios.post(process.env.PTERODACTYL_BASE_URL + '/api/application/servers', serverConfig, {
        headers: {
            'Authorization': 'Bearer ' + process.env.PTERODACTYL_API_KEY as string
        }
    }).then(function (response) {
        Logger.info('Pterodactyl server created');
        updateData();
        response.data.attributes.address = allocationData.attributes.alias + ':' + allocationData.attributes.port;
        callback(response.data)
    }).catch(function (error) {
        Logger.error(error);
        callback(null);
    });
}

export function createAccount(email: string, username: string, fistname: string, lastname: string, password: string, callback: CallableFunction) {
    axios.post(process.env.PTERODACTYL_BASE_URL + '/api/application/users', {
        email: email,
        username: username,
        first_name: fistname,
        last_name: lastname,
        password: password
    }, {
        headers: {
            'Authorization': 'Bearer ' + process.env.PTERODACTYL_API_KEY as string
        }
    }).then(function (response) {
        if (response.status === 201) {
            callback({ success: true, pterodactylUserId: response.data.attributes.id });
        }
    }).catch(function (error) {
        if (error.response.status === 422) {
            callback({ success: false, message: "Der Benutzername oder die E-Mail Addresse ist bereits vergeben!" });
        } else {
            callback({ success: false, message: "Ein Fehler ist aufgetreten. Versuche es später erneut." });
        }
    });
}

export function getEggById(id: number) {
    for (var i = 0; i < eggs.length; i++) {
        if (eggs[i].attributes.id == id) {
            return eggs[i];
        }
    }
    return null;
}

export function getUnassignedAllocation() {
    for (var i = 0; i < allocations.length; i++) {
        if (allocations[i].attributes.assigned == false) {
            return allocations[i];
        }
    }
    return null;
}

export function getLimitsByEggId(eggId: number) {
    for (var i = 0; i < eggData.data.length; i++) {
        if (eggData.data[i].eggId == eggId) {
            return eggData.data[i].limits;
        }
    }
    return null;
}