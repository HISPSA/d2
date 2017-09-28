/**
 * @module datastore
 */

import { isArray } from '../lib/check';
import DataStoreNamespace from './DataStoreNamespace';
import Api from '../api/Api';

/**
 * @description
 * Represents the dataStore that can be interacted with. This can be used to get instances of DataStoreNamespace, which
 * can be used to interact with the namespace API.
 *
 * @example
 * import init from 'd2';
 *
 * init({baseUrl: '/dhis/api'})
 *   .then((d2) => {
 *     d2.dataStore.get('namespace').then(namespace => {
 *          namespace.get('key').then(value => console.log(value))
 *      });
 *   });
 *
 * @memberof module:datastore
 */
class DataStore {
    constructor(api = Api.getApi()) {
        this.endPoint = 'dataStore';

        this.api = api;
    }

    /**
     * @description
     * Retrieves a list of keys for the given namespace, and returns an instance of DataStoreNamespace that
     * may be used to interact with this namespace. See {@link DataStoreNamespace}.
     *
     * Note that a namespace cannot exist without at least one key-value pair, for this reason
     * there is no 'create'- method. It is therefore advised to call this method with autoLoad = false
     * if you are creating a namespace (or you will get a 404-error in the console, as it
     * tries to load a namespace that does not exist).
     *
     * Example for creation of a new namespace
     * '''js
     * d2.dataStore.get('new namespace', false).then(namespace => {
     *     namespace.set('new key', value);
     *'''
     * @param namespace to get.
     * @param autoLoad if true, autoloads the keys of the namespace from the server
     * before the namespace is created. If false, an instance of he namespace is returned without any keys.
     *  Default true
     * @returns {Promise<DataStoreNamespace>} An instance of a DataStoreNamespace representing the namespace that can be interacted with.
     */
    get(namespace, autoLoad = true) {
        if (!autoLoad) {
            return new Promise((resolve) => {
                resolve(new DataStoreNamespace(namespace));
            });
        }

        return this.api.get([this.endPoint, namespace].join('/'))
            .then((response) => {
                if (response && isArray(response)) {
                    return new DataStoreNamespace(namespace, response);
                }
                throw new Error('The requested namespace has no keys or does not exist.');
            }).catch((e) => {
                if (e.httpStatusCode === 404) {
                    // If namespace does not exist, provide an instance of DataStoreNamespace
                    // so it's possible to interact with the namespace.
                    return new DataStoreNamespace(namespace);
                }
                throw e;
            });
    }


    /**
     * Retrieves a list of all public namespaces on the server.
     * @returns {Promise} with an array of namespaces.
     */
    getAll() {
        return this.api.get(this.endPoint)
            .then((response) => {
                if (response && isArray(response)) {
                    return response;
                }
                throw new Error('No namespaces exist.');
            });
    }

    /**
     * Deletes a namespace
     *
     * @param {string} namespace The namespace to delete
     * @returns {Promise} with the response from the API.
     */
    delete(namespace) {
        return this.api.delete([this.endPoint, namespace].join('/'));
    }

    /**
     * @static
     *
     * @returns {DataStore} Object with the dataStore interaction properties
     *
     * @description
     * Get a new instance of the dataStore object. This will function as a singleton, when a DataStore object has been created
     * when requesting getDataStore again the original version will be returned.
     */
    static getDataStore() {
        if (!DataStore.getDataStore.dataStore) {
            DataStore.getDataStore.dataStore = new DataStore();
        }

        return DataStore.getDataStore.dataStore;
    }
}

export default DataStore;
