// Use these two lines for Sample Contract dataset (rooted at Account entity)
import sampleResponseData from './data/sample.Contracts.Response.webapi.json';
import sampleResponseColumnLayout from './data/sample.Contracts.columnLayout.webapi.json';

// Use these two lines for Sample Connections dataset (rooted at Connection entity)
//import sampleResponseData from './data/sample.Connections.Response.webapi.json';
//import sampleResponseColumnLayout from './data/sample.Connections.columnLayout.webapi.json';

export function GetSampleData() {
    // For WebApi response with value node

    // Use following for Sample Contract dataset (rooted at Account entity)
    return { dataItems : sampleResponseData.value, columns : sampleResponseColumnLayout, primaryEntityName : 'account' };
    
    // Use following for Sample Connections dataset (rooted at Connection entity)
    //return { dataItems : sampleResponseData.value, columns : sampleResponseColumnLayout, primaryEntityName : 'connection' };

  }