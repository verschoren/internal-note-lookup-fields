const subdomain = 'internalnote' //your Zendesk subdomain
const auth = 'abc123def456xyz789=' //Base64 Encode admin@company.com/token:{token}

addEventListener('fetch', event => {
  const { request } = event;
  const { url } = request;

  if (request.method === 'POST') {
    return event.respondWith(handleRequest(request));
  } else if (request.method === 'GET') {
    return event.respondWith(new Response('We support only POST', {status: 405,statusText: 'Method not allowed'}));
  }
});

async function handleRequest(request) {
  const payload = await request.json();
  var account_manager = await getAccountManager(payload.organization);
  var follower = await updateFollower(payload.ticket,account_manager);
  return new Response('Follower Added');
}
      
async function getAccountManager(organization_id){
    const url = 'https://'+subdomain+'.zendesk.com/api/v2/organizations/'+organization_id+'.json';

    const init = {
      method: 'GET',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'Authorization': 'Basic ' + auth,
      },
    };
          
    const response = await fetch(url, init);
    const results = await response.json();
    return results.organization.organization_fields.account_manager;
}

async function updateFollower(ticket_id,account_manager){
  const url = 'https://'+subdomain+'.zendesk.com/api/v2/tickets/'+ticket_id+'.json';
  
  var body = {
    "ticket": {
      "followers": [
        { "user_id": account_manager+2, "action": "put" }
      ]
    }
  }

  const init = {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'Authorization': 'Basic ' + auth,
    },
  };
          
  const response = await fetch(url, init);
  const results = await response.json();
  return results;
}
