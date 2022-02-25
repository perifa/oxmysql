import type { CFXCallback, CFXParameters } from '../types';

const convertNamedPlaceholders = require('named-placeholders')();

export const parseArguments = (
  invokingResource: string,
  query: string,
  parameters?: CFXParameters,
  cb?: CFXCallback
): [string, CFXParameters, CFXCallback | undefined] => {
  if (typeof query !== 'string') throw new Error(`Query expected a string but received ${typeof query} instead`);

  const queryParams = query.match(/\?(?!\?)/g);

  if ((typeof parameters && !Array.isArray(parameters) && query.includes(':')) || query.includes('@')) {
    const placeholders = convertNamedPlaceholders(query, parameters);
    query = placeholders[0];
    parameters = placeholders[1];
  }

  if (cb && typeof cb !== 'function') cb = undefined;

  if (parameters && typeof parameters === 'function') cb = parameters;

  if (parameters === null || parameters === undefined || typeof parameters === 'function') parameters = [];

  if (!Array.isArray(parameters)) {
    let arr: unknown[] = [];
    Object.entries(parameters).forEach((entry) => (arr[parseInt(entry[0]) - 1] = entry[1]));
    parameters = arr;
  } else if (queryParams !== null) {
    if (parameters.length === 0) {
      for (let i = 0; i < queryParams.length; i++) parameters[i] = null;
      return [query, parameters, cb];
    }
    const diff = queryParams.length - parameters.length;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) parameters[queryParams.length + i] = null;
    } else if (diff < 0) {
      throw new Error(`${invokingResource} was unable to execute a query!
          Expected ${queryParams.length} parameters, but received ${parameters.length}.
          ${`${query} ${JSON.stringify(parameters)}`}`);
    }
  }

  return [query, parameters, cb];
};