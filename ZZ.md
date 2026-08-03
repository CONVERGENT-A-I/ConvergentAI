{
  "info": {
    "_postman_id": "de5d8e28-ee6b-46a5-bd9c-b86229d96639",
    "name": "The Gene Group - CRS API Sandbox (DEMO) - 20260714",
    "description": "**All of the below products are accessed through the CRS API.**\n\n- Authentication uses a login request to obtain a Bearer token and Refresh token.\n    \n- The Sandbox environment supports only the predefined test identities.\n    \n- When moving to **production**, CRS will provide new credentials and a new host URL.\n    \n- No testing is permitted in the live environment, so be sure to limit your testing to the sandbox environment.\n    \n\n**This Sandbox environment replicates production behavior, so please limit all testing to the sandbox to avoid unintended production inquiries.**",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "49001966"
  },
  "item": [
    {
      "name": "User Utilities",
      "item": [
        {
          "name": "User Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "var data = pm.response.json();\r",
                  "if(data) {\r",
                  "    if(data.token) pm.collectionVariables.set(\"utoken\",data.token);\r",
                  "    if(data.refreshToken) pm.collectionVariables.set(\"uRefreshToken\",data.refreshToken);\r",
                  "}"
                ],
                "type": "text/javascript",
                "packages": {},
                "requests": {}
              }
            }
          ],
          "request": {
            "auth": {
              "type": "noauth"
            },
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Accept",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"{{client_id}}\",\n  \"password\": \"{{client_secret}}\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/users/login",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "users",
                "login"
              ]
            },
            "description": "Will login user and allow access to user endpoints given the correct credientials in the request payload. Returns a user JWT token (utoken) that will need to be passed as a header to each user endpoint. This sandbox contains a script to update utoken headers automatically when this request is sent."
          },
          "response": [
            {
              "name": "OK",
              "originalRequest": {
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"username\": \"\",\n  \"password\": \"\"\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "https://api-sandbox.stitchcredit.com:443/api/users/login",
                  "protocol": "https",
                  "host": [
                    "api-sandbox",
                    "stitchcredit",
                    "com"
                  ],
                  "port": "443",
                  "path": [
                    "api",
                    "users",
                    "login"
                  ]
                }
              },
              "status": "OK",
              "code": 200,
              "_postman_previewlanguage": "json",
              "header": [
                {
                  "key": "Date",
                  "value": "Thu, 09 Oct 2025 21:12:51 GMT"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json",
                  "description": "",
                  "type": "text"
                },
                {
                  "key": "Transfer-Encoding",
                  "value": "chunked"
                },
                {
                  "key": "Connection",
                  "value": "keep-alive"
                },
                {
                  "key": "Vary",
                  "value": "Origin"
                },
                {
                  "key": "Vary",
                  "value": "Access-Control-Request-Method"
                },
                {
                  "key": "Vary",
                  "value": "Access-Control-Request-Headers"
                },
                {
                  "key": "RequestID",
                  "value": "5b15921b-3e50-452a-9ab1-c083c8a91cb1"
                },
                {
                  "key": "X-XSS-Protection",
                  "value": "1; mode=block"
                },
                {
                  "key": "Cache-Control",
                  "value": "no-cache, no-store, max-age=0, must-revalidate"
                },
                {
                  "key": "Pragma",
                  "value": "no-cache"
                },
                {
                  "key": "Expires",
                  "value": "0"
                }
              ],
              "cookie": [],
              "body": "{\n    \"id\": \"1fd44ef1-839f-49ed-9d77-a7e02d2ee000\",\n    \"clientName\": \"Lehigh Properties Update Inc.\",\n    \"clientNumber\": \"CID13286\",\n    \"name\": \"Test Demo\",\n    \"email\": \"Test Demo\",\n    \"roles\": 3221225471,\n    \"createdAt\": \"2025-10-08T17:26:03.213+00:00\",\n    \"mclI\": \"\",\n    \"mclU\": \"\",\n    \"enabled\": true,\n    \"disableReason\": \"\",\n    \"token\": \"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxZmQ0NGNkMS04MzlmLTQ5ZWQtOWQ3Ny1hN2UwMmQyZWUwMDAiLCJpYXQiOjE3NjAwNDQzNzEsImV4cCI6MTc2MDA0Nzk3MX0.7bauxg_DqLx3QjWv4Z_b-cVVvtZsIj8_3VSLaWXphGAaK7h4rWvzZH6VwmVAI_bSCDRysKG77T3IWhWr_zhMcg\",\n    \"expires\": 3600,\n    \"refreshToken\": \"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxZmQ0NGNkMS04MzlmLTQ5ZWQtOWQ3Ny1hN2UwMmQyZWUwMDAiLCJpYXQiOjE3NjAwNDQzNzEsIm5iZiI6MTc2MDA0Nzk0MSwiZXhwIjoxNzYwMDUxNTcxfQ.GuIjrq7I-rbCoRqhQE_RMg8mL8E0OSWQuSGgmGH6zARb6XZORfxxcQ5dkVvyw_CD0NmICLFpqJU24041R1kEbw\"\n}"
            },
            {
              "name": "Incorrect Creds",
              "originalRequest": {
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"username\": \"incorrect_username\",\n  \"password\": \"incorrect_password\"\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/users/login",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "users",
                    "login"
                  ]
                }
              },
              "status": "Unauthorized",
              "code": 401,
              "_postman_previewlanguage": "json",
              "header": [
                {
                  "key": "Date",
                  "value": "Thu, 09 Oct 2025 21:39:51 GMT"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json",
                  "description": "",
                  "type": "text"
                },
                {
                  "key": "Transfer-Encoding",
                  "value": "chunked"
                },
                {
                  "key": "Connection",
                  "value": "keep-alive"
                },
                {
                  "key": "Vary",
                  "value": "Origin"
                },
                {
                  "key": "Vary",
                  "value": "Access-Control-Request-Method"
                },
                {
                  "key": "Vary",
                  "value": "Access-Control-Request-Headers"
                },
                {
                  "key": "RequestID",
                  "value": "d9902f54-958e-4645-9b42-08193509ab1f"
                },
                {
                  "key": "X-XSS-Protection",
                  "value": "1; mode=block"
                },
                {
                  "key": "Cache-Control",
                  "value": "no-cache, no-store, max-age=0, must-revalidate"
                },
                {
                  "key": "Pragma",
                  "value": "no-cache"
                },
                {
                  "key": "Expires",
                  "value": "0"
                }
              ],
              "cookie": [
                {
                  "expires": "Invalid Date",
                  "domain": "",
                  "path": ""
                }
              ],
              "body": "{\n    \"timestamp\": \"2025-10-09T21:39:51.613+00:00\",\n    \"codes\": [\n        \"CRS113\"\n    ],\n    \"messages\": [\n        \"Access Denied\"\n    ],\n    \"details\": []\n}"
            }
          ]
        },
        {
          "name": "Refresh token",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "var data = pm.response.json();\r",
                  "if(data) {\r",
                  "    if(data.token) pm.collectionVariables.set(\"utoken\",data.token);\r",
                  "    if(data.refreshToken) pm.collectionVariables.set(\"uRefreshToken\",data.refreshToken);\r",
                  "}"
                ],
                "type": "text/javascript",
                "packages": {},
                "requests": {}
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Accept",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"refreshToken\": \"{{uRefreshToken}}\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/users/refresh-token",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "users",
                "refresh-token"
              ]
            }
          },
          "response": []
        },
        {
          "name": "User Details",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Accept",
                "value": "application/json"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/users",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "users"
              ]
            },
            "description": "Retrieves details for the current user."
          },
          "response": [
            {
              "name": "OK",
              "originalRequest": {
                "method": "GET",
                "header": [
                  {
                    "key": "Accept",
                    "value": "application/json"
                  },
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  }
                ],
                "url": {
                  "raw": "https://api-sandbox.stitchcredit.com:443/api/users",
                  "protocol": "https",
                  "host": [
                    "api-sandbox",
                    "stitchcredit",
                    "com"
                  ],
                  "port": "443",
                  "path": [
                    "api",
                    "users"
                  ]
                }
              },
              "status": "OK",
              "code": 200,
              "_postman_previewlanguage": "Text",
              "header": [
                {
                  "key": "Date",
                  "value": "Thu, 09 Oct 2025 21:53:58 GMT"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                },
                {
                  "key": "Transfer-Encoding",
                  "value": "chunked"
                },
                {
                  "key": "Connection",
                  "value": "keep-alive"
                },
                {
                  "key": "Vary",
                  "value": "Origin"
                },
                {
                  "key": "Vary",
                  "value": "Access-Control-Request-Method"
                },
                {
                  "key": "Vary",
                  "value": "Access-Control-Request-Headers"
                },
                {
                  "key": "RequestID",
                  "value": "38a45926-b043-4d06-b09b-4a5affd1b87d"
                },
                {
                  "key": "userId",
                  "value": "1fd44cd1-839f-49ed-9d77-a7e02d2ee000"
                },
                {
                  "key": "X-XSS-Protection",
                  "value": "1; mode=block"
                },
                {
                  "key": "Cache-Control",
                  "value": "no-cache, no-store, max-age=0, must-revalidate"
                },
                {
                  "key": "Pragma",
                  "value": "no-cache"
                },
                {
                  "key": "Expires",
                  "value": "0"
                }
              ],
              "cookie": [],
              "body": "{\n    \"id\": \"1fd44de1-839f-49ed-9d77-a7e02d2ee000\",\n    \"clientName\": \"Lehigh Properties Update Inc.\",\n    \"clientNumber\": \"CID13286\",\n    \"name\": \"Test Demo\",\n    \"email\": \"Test Demo\",\n    \"roles\": 3221225471,\n    \"createdAt\": \"2025-10-08T17:26:03.213+00:00\",\n    \"mclI\": \"\",\n    \"mclU\": \"\",\n    \"enabled\": true,\n    \"disableReason\": \"\"\n}"
            }
          ]
        },
        {
          "name": "Get CRS Error Codes",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Accept",
                "value": "application/json"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/sys/errors",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "sys",
                "errors"
              ]
            },
            "description": "Utility endpoint to retireve all the CRS Error Codes and descriptions of what each one means."
          },
          "response": [
            {
              "name": "OK",
              "originalRequest": {
                "method": "GET",
                "header": [
                  {
                    "key": "Accept",
                    "value": "application/json"
                  },
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  }
                ],
                "url": {
                  "raw": "https://api-sandbox.stitchcredit.com:443/api/sys/errors",
                  "protocol": "https",
                  "host": [
                    "api-sandbox",
                    "stitchcredit",
                    "com"
                  ],
                  "port": "443",
                  "path": [
                    "api",
                    "sys",
                    "errors"
                  ]
                }
              },
              "status": "OK",
              "code": 200,
              "_postman_previewlanguage": "json",
              "header": [
                {
                  "key": "Date",
                  "value": "Thu, 09 Oct 2025 21:49:30 GMT"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json",
                  "description": "",
                  "type": "text"
                },
                {
                  "key": "Transfer-Encoding",
                  "value": "chunked"
                },
                {
                  "key": "Connection",
                  "value": "keep-alive"
                },
                {
                  "key": "Vary",
                  "value": "Origin"
                },
                {
                  "key": "Vary",
                  "value": "Access-Control-Request-Method"
                },
                {
                  "key": "Vary",
                  "value": "Access-Control-Request-Headers"
                },
                {
                  "key": "RequestID",
                  "value": "01cea49c-0e96-4a9e-800d-d67fbf32d7dc"
                },
                {
                  "key": "userId",
                  "value": "1fd44cd1-839f-49ed-9d77-a7e02d2ee000"
                },
                {
                  "key": "X-XSS-Protection",
                  "value": "1; mode=block"
                },
                {
                  "key": "Cache-Control",
                  "value": "no-cache, no-store, max-age=0, must-revalidate"
                },
                {
                  "key": "Pragma",
                  "value": "no-cache"
                },
                {
                  "key": "Expires",
                  "value": "0"
                }
              ],
              "cookie": [],
              "body": "[\n    {\n        \"code\": \"CRS103\",\n        \"message\": \"Account Disabled\",\n        \"description\": \"Reason for account disabling is entered by account manager.\"\n    },\n    {\n        \"code\": \"CRS111\",\n        \"message\": \"Access Denied\"\n    },\n    {\n        \"code\": \"CRS112\",\n        \"message\": \"Access Denied\",\n        \"description\": \"Unauthorized access.\"\n    },\n    {\n        \"code\": \"CRS113\",\n        \"message\": \"Access Denied\",\n        \"description\": \"The provided credentials are invalid.\"\n    },\n    {\n        \"code\": \"CRS114\",\n        \"message\": \"Access Denied\",\n        \"description\": \"Account is locked due to too many failed login attempts.Contact support at support@crscreditapi.com for help.\"\n    },\n    {\n        \"code\": \"CRS115\",\n        \"message\": \"Access Denied\",\n        \"description\": \"IP is locked due to too many failed login attempts. Contact support at support@crscreditapi.com for help.\"\n    },\n    {\n        \"code\": \"CRS109\",\n        \"message\": \"Service Unavailable\",\n        \"description\": \"HTTP request took too long to complete. Please try again.\"\n    },\n    {\n        \"code\": \"CRS101\",\n        \"message\": \"User Not Found\"\n    },\n    {\n        \"code\": \"CRS102\",\n        \"message\": \"The required configuration for this product is not available. Please contact your account administrator for assistance.\"\n    },\n    {\n        \"code\": \"CRS107\",\n        \"message\": \"User Token Expired\"\n    },\n    {\n        \"code\": \"CRS108\",\n        \"message\": \"User Token Invalid\"\n    },\n    {\n        \"code\": \"CRS117\",\n        \"message\": \"Refresh Token Premature\"\n    },\n    {\n        \"code\": \"CRS060\",\n        \"message\": \"No matching property\"\n    },\n    {\n        \"code\": \"CRS502\",\n        \"message\": \"Precise ID Error\"\n    },\n    {\n        \"code\": \"CRS601\",\n        \"message\": \"CrossCore Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS604\",\n        \"message\": \"Command Credit Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS200\",\n        \"message\": \"Request arguments not valid\"\n    },\n    {\n        \"code\": \"CRS960\",\n        \"message\": \"Missing request body\"\n    },\n    {\n        \"code\": \"CRS950\",\n        \"message\": \"Invalid Date Time\"\n    },\n    {\n        \"code\": \"CRS951\",\n        \"message\": \"Invalid Format\"\n    },\n    {\n        \"code\": \"CRS970\",\n        \"message\": \"HTTP message not readable\"\n    },\n    {\n        \"code\": \"CRS961\",\n        \"message\": \"Maximum daily requests exceeded\"\n    },\n    {\n        \"code\": \"CRS602\",\n        \"message\": \"Experian Business Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS801\",\n        \"message\": \"Experian Credit Profile Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS401\",\n        \"message\": \"Service Issue\"\n    },\n    {\n        \"code\": \"CRS054\",\n        \"message\": \"Invalid WatchList\"\n    },\n    {\n        \"code\": \"CRS938\",\n        \"message\": \"Access Denied\",\n        \"description\": \"Token is locked to the IP address.\"\n    },\n    {\n        \"code\": \"CRS701\",\n        \"message\": \"MCL Error\",\n        \"description\": \"Meridian Credit Link Error\"\n    },\n    {\n        \"code\": \"CRS700\",\n        \"message\": \"MCL Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS492\",\n        \"message\": \"PDF Generation Failed\"\n    },\n    {\n        \"code\": \"CRS702\",\n        \"message\": \"PitchPoint Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS802\",\n        \"message\": \"Reverse Phone Append Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS100\",\n        \"message\": \"Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS939\",\n        \"message\": \"Token Required\"\n    },\n    {\n        \"code\": \"CRS901\",\n        \"message\": \"Transunion error\"\n    },\n    {\n        \"code\": \"CRS777\",\n        \"message\": \"AtData Service Error\"\n    },\n    {\n        \"code\": \"CRS778\",\n        \"message\": \"Lexis Nexis Instant ID Service Error\"\n    },\n    {\n        \"code\": \"CRS779\",\n        \"message\": \"Lexis Nexis BPS Report Service Error\"\n    },\n    {\n        \"code\": \"CRS780\",\n        \"message\": \"Lexis Nexis Top Business Report Service Error\"\n    },\n    {\n        \"code\": \"CRS781\",\n        \"message\": \"Lexis Nexis Top Business Search Service Error\"\n    },\n    {\n        \"code\": \"CRS501\",\n        \"message\": \"Search Bridger Insight Service Error\"\n    },\n    {\n        \"code\": \"CRS605\",\n        \"message\": \"Search Bridger Insight Service Unavailable\"\n    },\n    {\n        \"code\": \"CRS271\",\n        \"message\": \"Missing subject records\",\n        \"description\": \"Invalid request. Missing subject records object inside Transunion request object.\"\n    },\n    {\n        \"code\": \"CRS162\",\n        \"message\": \"Equifax Service Error\"\n    },\n    {\n        \"code\": \"CRS272\",\n        \"message\": \"Missing PDF\",\n        \"description\": \"No pdf returned. Contact support at support@crscreditapi.com to make sure PDF addon is enabled for you.\"\n    },\n    {\n        \"code\": \"CRS161\",\n        \"message\": \"Applicants address is not located in a county that has an instant search available due to county limitations. Continuing with this order may result in searching adjacent counties with instant results available. Providing additional addresses may result in additional information not available with the address provided. If you would like to confirm a search is to be completed in the applicant's county of residence, then please make another request which will override coverage check with setting flag 'coverageCheckDisabled' to true and then contact customer service to place a manual search request. Additional search fees may apply.\"\n    },\n    {\n        \"code\": \"CRS404\",\n        \"message\": \"Resource Not Found\"\n    },\n    {\n        \"code\": \"CRS750\",\n        \"message\": \"Credit File Initialization Failed\"\n    },\n    {\n        \"code\": \"CRS751\",\n        \"message\": \"Credit File Update Failed\"\n    },\n    {\n        \"code\": \"CRS752\",\n        \"message\": \"Credit File Transaction Failed\"\n    },\n    {\n        \"code\": \"CRS753\",\n        \"message\": \"Credit File Transaction Failed\"\n    },\n    {\n        \"code\": \"CRS405\",\n        \"message\": \"Could not execute price increase. Price is missing on the base config.\"\n    },\n    {\n        \"code\": \"CRS440\",\n        \"message\": \"Invalid Data\",\n        \"description\": \"Data is not usable.\"\n    },\n    {\n        \"code\": \"CRS441\",\n        \"message\": \"Invalid Config\",\n        \"description\": \"TransUnion Config Requires either crsPdfEnabled or customPdfEnabled when generating pdf.\"\n    },\n    {\n        \"code\": \"CRS444\",\n        \"message\": \"Credit Report Processing Error\"\n    },\n    {\n        \"code\": \"CR6501\",\n        \"message\": \"CRS Standard Format Error\",\n        \"description\": \"CRS Standard Format Parsing Failed\"\n    },\n    {\n        \"code\": \"CR6502\",\n        \"message\": \"OFAC Error\",\n        \"description\": \"OFAC Error. Contact support at support@crscreditapi.com.\"\n    },\n    {\n        \"code\": \"CR6503\",\n        \"message\": \"OFAC Error\",\n        \"description\": \"OFAC Error. Contact support at support@crscreditapi.com.\"\n    },\n    {\n        \"code\": \"CR6520\",\n        \"message\": \"MLA Error\",\n        \"description\": \"MLA Error. Contact support at support@crscreditapi.com.\"\n    },\n    {\n        \"code\": \"CR6521\",\n        \"message\": \"MLA Error\",\n        \"description\": \"MLA Error. Contact support at support@crscreditapi.com.\"\n    }\n]"
            }
          ]
        },
        {
          "name": "Get Logs",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/users/logs?page=0&size=200",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "users",
                "logs"
              ],
              "query": [
                {
                  "key": "page",
                  "value": "0"
                },
                {
                  "key": "size",
                  "value": "200"
                }
              ]
            },
            "description": "Retreives a log of each requested report. The user can view which reports came from cache and which were pulled."
          },
          "response": []
        },
        {
          "name": "Retention log JSON",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Accept",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/users/retention/{{RequestID}}",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "users",
                "retention",
                "{{RequestID}}"
              ]
            },
            "description": "Given a RequestID from a previous report this endpoint retrevies that report from CRS's secure database. CRS will store each requested report for 7 years per bureau regulations."
          },
          "response": []
        },
        {
          "name": "Retention log PDF",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Accept",
                "value": "*/*"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/users/retention-pdf/{{RequestID}}",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "users",
                "retention-pdf",
                "{{RequestID}}"
              ]
            },
            "description": "Given a Request ID from a previous PDF request this endpoint retrevies that PDF report from CRS's secure database. CRS will store each requested report for 7 years per bureau regulations."
          },
          "response": []
        },
        {
          "name": "Evict Cache By Request ID",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const header1 = pm.response.headers.get('RequestID');",
                  "if(header1) pm.environment.set(\"requestid\", header1);"
                ],
                "type": "text/javascript",
                "packages": {},
                "requests": {}
              }
            }
          ],
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{utoken}}",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Accept",
                "value": "application/json"
              },
              {
                "key": "Cache-Control",
                "value": "",
                "type": "text",
                "disabled": true
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/users/cache/evict/{{RequestID}}",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "users",
                "cache",
                "evict",
                "{{RequestID}}"
              ]
            }
          },
          "response": []
        }
      ],
      "description": "**All of the below products are accessed through the CRS API.**\n\n- Authentication uses a login request to obtain a Bearer token and Refresh token.\n    \n- The Sandbox environment supports only the predefined test identities.\n    \n- When moving to **production**, CRS will provide new credentials and a new host URL.\n    \n- No testing is permitted in the live environment, so be sure to limit your testing to the sandbox environment.\n    \n\n**This Sandbox environment replicates production behavior, so please limit all testing to the sandbox to avoid unintended production inquiries.**\n\n## Start Here!\n\nRun the sample request labeled, \"User Login\", to obtain a Bearer token to authorize use of each endpoint.\n\n### Auth and platform utilities for:\n\n<ul><li><div>JWT tokens</div></li><li><div>user info</div></li><li><div>errors</div></li><li><div>logs</div></li><li><div>retention</div></li><li><div>cache invalidation</div></li></ul>"
    },
    {
      "name": "Business Credit Report",
      "item": [
        {
          "name": "CCC Experian Business Credit",
          "item": [
            {
              "name": "[Step 1]: Business Search",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "var data = pm.response.json();",
                      "console.log(data);",
                      "if(data) {",
                      "    console.log(pm.response.headers.get(\"RequestID\"));",
                      "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                      "}",
                      ""
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                }
              ],
              "request": {
                "auth": {
                  "type": "bearer",
                  "bearer": [
                    {
                      "key": "token",
                      "value": "{{utoken}}",
                      "type": "string"
                    }
                  ]
                },
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"name\": \"ALTERNATIVE TRANSPORTATION SYSTEMS, LLC\",\n    \"street\": \"9 DUDLEY CT\",\n    \"city\": \"ARLINGTON\",\n    \"state\": \"MA\",\n    \"zip\": \"02476\",\n    \"phone\": \"7813160400\",\n    \"taxId\": \"841655523\"\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/ccc/exp/search",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "ccc",
                    "exp",
                    "search"
                  ]
                },
                "description": "In order to pull a business report Experian needs a BIN (Bank Identificaion Number) for that business. This endpoint retireves the BIN along with other data given a business's name, city, and state."
              },
              "response": [
                {
                  "name": "OK",
                  "originalRequest": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"name\": \"JW INTERIOR EXTERIOR WALLS SYSTEMS\",\n    \"city\": \"SYRACUSE\",\n    \"state\": \"NY\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "https://api-sandbox.stitchcredit.com:443/api/ccc/exp/search",
                      "protocol": "https",
                      "host": [
                        "api-sandbox",
                        "stitchcredit",
                        "com"
                      ],
                      "port": "443",
                      "path": [
                        "api",
                        "ccc",
                        "exp",
                        "search"
                      ]
                    }
                  },
                  "status": "OK",
                  "code": 200,
                  "_postman_previewlanguage": "json",
                  "header": [
                    {
                      "key": "Date",
                      "value": "Thu, 09 Oct 2025 22:18:51 GMT"
                    },
                    {
                      "key": "Content-Type",
                      "value": "application/json",
                      "description": "",
                      "type": "text"
                    },
                    {
                      "key": "Transfer-Encoding",
                      "value": "chunked"
                    },
                    {
                      "key": "Connection",
                      "value": "keep-alive"
                    },
                    {
                      "key": "Vary",
                      "value": "Origin"
                    },
                    {
                      "key": "Vary",
                      "value": "Access-Control-Request-Method"
                    },
                    {
                      "key": "Vary",
                      "value": "Access-Control-Request-Headers"
                    },
                    {
                      "key": "RequestID",
                      "value": "3931874a-a34c-49aa-8929-af52414cda3c"
                    },
                    {
                      "key": "userId",
                      "value": "1fd44cd1-839f-49ed-9d77-a7e02d2ee000"
                    },
                    {
                      "key": "X-XSS-Protection",
                      "value": "1; mode=block"
                    },
                    {
                      "key": "Cache-Control",
                      "value": "no-cache, no-store, max-age=0, must-revalidate"
                    },
                    {
                      "key": "Pragma",
                      "value": "no-cache"
                    },
                    {
                      "key": "Expires",
                      "value": "0"
                    }
                  ],
                  "cookie": [],
                  "body": "{\n    \"auth\": true,\n    \"result\": \"success\",\n    \"Business Search\": \"authorized\",\n    \"data\": [\n        {\n            \"bin\": \"713525982\",\n            \"reliabilityCode\": 91.02,\n            \"businessName\": \"JW INTERIOR EXTERIOR WALLS SYSTEMS\",\n            \"phone\": \"+13154511048\",\n            \"address\": {\n                \"street\": \"6750 PICKARD DR\",\n                \"city\": \"SYRACUSE\",\n                \"state\": \"NY\",\n                \"zip\": \"13211\",\n                \"zipExtension\": \"2115\"\n            },\n            \"numberOfTradelines\": 10,\n            \"financialStatementIndicator\": false,\n            \"keyFactsIndicator\": true,\n            \"inquiryIndicator\": false,\n            \"bankDataIndicator\": true,\n            \"governmentDataIndicator\": false,\n            \"executiveSummaryIndicator\": true,\n            \"uccIndicator\": true,\n            \"matchingNameAndAddress\": {\n                \"businessName\": \"JW INTRIOR EXTERR WALLS SY\",\n                \"address\": {\n                    \"street\": \"900 OLD LIVERPOOL RD\",\n                    \"city\": \"LIVERPOOL\",\n                    \"state\": \"NY\",\n                    \"zip\": \"130885570\"\n                }\n            }\n        }\n    ]\n}"
                }
              ]
            },
            {
              "name": "[Step 2]: JSON Business Premier Profile Report",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "var data = pm.response.json();",
                      "console.log(data);",
                      "if(data) {",
                      "    console.log(pm.response.headers.get(\"RequestID\"));",
                      "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                      "}",
                      ""
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                }
              ],
              "request": {
                "auth": {
                  "type": "bearer",
                  "bearer": [
                    {
                      "key": "token",
                      "value": "{{utoken}}",
                      "type": "string"
                    }
                  ]
                },
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"bin\": \"412123923\",\n    \"modelCode\": \"000250\"\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/ccc/exp/report",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "ccc",
                    "exp",
                    "report"
                  ]
                },
                "description": "Given the BIN retrieved from step 1, this endpoint pulls the Experian Business Premier Profile report asciated with that BIN."
              },
              "response": [
                {
                  "name": "OK",
                  "originalRequest": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\"bin\":\"725227333\"}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/ccc/exp/report",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "ccc",
                        "exp",
                        "report"
                      ]
                    }
                  },
                  "status": "OK",
                  "code": 200,
                  "_postman_previewlanguage": "json",
                  "header": [
                    {
                      "key": "Date",
                      "value": "Thu, 09 Oct 2025 22:19:22 GMT"
                    },
                    {
                      "key": "Content-Type",
                      "value": "application/json",
                      "description": "",
                      "type": "text"
                    },
                    {
                      "key": "Transfer-Encoding",
                      "value": "chunked"
                    },
                    {
                      "key": "Connection",
                      "value": "keep-alive"
                    },
                    {
                      "key": "Vary",
                      "value": "Origin"
                    },
                    {
                      "key": "Vary",
                      "value": "Access-Control-Request-Method"
                    },
                    {
                      "key": "Vary",
                      "value": "Access-Control-Request-Headers"
                    },
                    {
                      "key": "RequestID",
                      "value": "0196d45b-c271-4280-9f71-401fab24c895"
                    },
                    {
                      "key": "userId",
                      "value": "1fd44cd1-839f-49ed-9d77-a7e02d2ee000"
                    },
                    {
                      "key": "X-XSS-Protection",
                      "value": "1; mode=block"
                    },
                    {
                      "key": "Cache-Control",
                      "value": "no-cache, no-store, max-age=0, must-revalidate"
                    },
                    {
                      "key": "Pragma",
                      "value": "no-cache"
                    },
                    {
                      "key": "Expires",
                      "value": "0"
                    }
                  ],
                  "cookie": [],
                  "body": "{\n    \"auth\": true,\n    \"result\": \"success\",\n    \"PPR\": \"authorized\",\n    \"data\": {\n        \"businessHeader\": {\n            \"bin\": \"725227333\",\n            \"businessName\": \"ANTHONY PROPERTIES, INC\",\n            \"address\": {\n                \"street\": \"PO BOX 1055\",\n                \"city\": \"ROSWELL\",\n                \"state\": \"GA\",\n                \"zip\": \"30077\",\n                \"zipExtension\": \"1055\"\n            },\n            \"phone\": \"+17709921868\",\n            \"taxId\": \"581117533\",\n            \"legalBusinessName\": \"ANTHONY PROPERTIES, INC.\",\n            \"dbaNames\": [],\n            \"customerDisputeIndicator\": false,\n            \"foreignCountry\": false,\n            \"corporateLinkageIndicator\": true,\n            \"matchingBranchAddress\": {},\n            \"branchLocation\": {}\n        },\n        \"collectionsDetail\": [],\n        \"tradePaymentExperiences\": [\n            {\n                \"paymentIndicator\": {\n                    \"code\": \" \",\n                    \"definition\": \"No Indicator\"\n                },\n                \"businessCategory\": \"FINCL SVCS\",\n                \"dateReported\": \"2025-06-01\",\n                \"terms\": \"CONTRCT\",\n                \"recentHighCredit\": {\n                    \"modifier\": \"Not applicable\",\n                    \"amount\": 299100\n                },\n                \"accountBalance\": {\n                    \"modifier\": \"Not applicable\",\n                    \"amount\": 299100\n                },\n                \"currentPercentage\": 100,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0,\n                \"tradelineFlag\": {\n                    \"definition\": \" \"\n                },\n                \"newlyReportedIndicator\": {\n                    \"code\": \" \",\n                    \"definition\": \"Not Available\"\n                }\n            },\n            {\n                \"paymentIndicator\": {\n                    \"code\": \" \",\n                    \"definition\": \"No Indicator\"\n                },\n                \"businessCategory\": \"PACKAGING\",\n                \"dateReported\": \"2025-07-01\",\n                \"terms\": \"NET 30\",\n                \"recentHighCredit\": {\n                    \"modifier\": \"Not applicable\",\n                    \"amount\": 0\n                },\n                \"accountBalance\": {\n                    \"modifier\": \"Not applicable\",\n                    \"amount\": 0\n                },\n                \"currentPercentage\": 0,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0,\n                \"comments\": \"CUST  3 YR\",\n                \"tradelineFlag\": {\n                    \"definition\": \" \"\n                },\n                \"newlyReportedIndicator\": {\n                    \"code\": \" \",\n                    \"definition\": \"Not Available\"\n                }\n            }\n        ],\n        \"paymentTotals\": {\n            \"newlyReportedTradelines\": {\n                \"totalHighCreditAmount\": {},\n                \"totalAccountBalance\": {},\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0,\n                \"dbt\": 0\n            },\n            \"continuouslyReportedTradelines\": {\n                \"totalHighCreditAmount\": {\n                    \"amount\": 299100\n                },\n                \"totalAccountBalance\": {\n                    \"amount\": 299100\n                },\n                \"currentPercentage\": 100,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0,\n                \"numberOfLines\": 2,\n                \"dbt\": 0\n            },\n            \"combinedTradelines\": {\n                \"totalHighCreditAmount\": {\n                    \"amount\": 299100\n                },\n                \"totalAccountBalance\": {\n                    \"amount\": 299100\n                },\n                \"currentPercentage\": 100,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0,\n                \"numberOfLines\": 2,\n                \"dbt\": 0\n            },\n            \"additionalTradelines\": {\n                \"totalHighCreditAmount\": {},\n                \"totalAccountBalance\": {},\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0\n            },\n            \"tradelines\": {\n                \"totalHighCreditAmount\": {\n                    \"amount\": 299100\n                },\n                \"totalAccountBalance\": {\n                    \"amount\": 299100\n                },\n                \"currentPercentage\": 100,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0,\n                \"numberOfLines\": 2\n            }\n        },\n        \"monthlyPaymentTrends\": [\n            {\n                \"date\": \"2025-10-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 299100\n                },\n                \"currentPercentage\": 100\n            },\n            {\n                \"date\": \"2024-10-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 299100\n                },\n                \"currentPercentage\": 100\n            },\n            {\n                \"date\": \"2024-09-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {}\n            },\n            {\n                \"date\": \"2024-08-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 32900\n                },\n                \"currentPercentage\": 100\n            },\n            {\n                \"date\": \"2024-07-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 32900\n                },\n                \"currentPercentage\": 100\n            },\n            {\n                \"date\": \"2024-06-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 32900\n                },\n                \"currentPercentage\": 100\n            },\n            {\n                \"date\": \"2024-05-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 37000\n                },\n                \"currentPercentage\": 100\n            }\n        ],\n        \"quarterlyPaymentTrends\": [\n            {\n                \"date\": \"2018-01-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {},\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0\n            },\n            {\n                \"date\": \"2017-10-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 32900\n                },\n                \"currentPercentage\": 100,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0\n            },\n            {\n                \"date\": \"2017-07-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 38300\n                },\n                \"currentPercentage\": 100,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0\n            },\n            {\n                \"date\": \"2017-04-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 84200\n                },\n                \"currentPercentage\": 100,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0\n            },\n            {\n                \"date\": \"2017-01-01\",\n                \"dbt\": 0,\n                \"totalAccountBalance\": {\n                    \"amount\": 117100\n                },\n                \"currentPercentage\": 100,\n                \"dbt30\": 0,\n                \"dbt60\": 0,\n                \"dbt90\": 0,\n                \"dbt91Plus\": 0\n            }\n        ],\n        \"bankruptcyDetail\": [],\n        \"taxLienDetail\": [],\n        \"judgmentDetail\": [],\n        \"uccFilingsSummary\": {\n            \"uccFilingsTrends\": []\n        },\n        \"uccFilingsDetail\": [],\n        \"corporateRegistration\": {\n            \"stateOfOrigin\": \"GA\",\n            \"charterNumber\": \"H107564\",\n            \"recentFilingDate\": \"2025-05-12\",\n            \"incorporatedDate\": \"1979-03-10\",\n            \"businessType\": \"Incorporated\",\n            \"statusFlag\": {\n                \"code\": \"A\",\n                \"definition\": \"Active\"\n            },\n            \"profitFlag\": \"Profit\",\n            \"domesticForeignIndicator\": \"D\",\n            \"agentName\": \"ANTHONY, FRED D.\",\n            \"agentAddress\": {\n                \"street\": \"12265 KING CIRCLE ROSWELL GA 30077\",\n                \"city\": \"ROSWELL\",\n                \"state\": \"GA\"\n            }\n        },\n        \"executiveInformation\": [\n            {\n                \"firstName\": \"FRED\",\n                \"lastName\": \"ANTHONY\",\n                \"title\": \"CEO\"\n            },\n            {\n                \"firstName\": \"DAVID\",\n                \"middleName\": \"W\",\n                \"lastName\": \"ANTHONY\",\n                \"title\": \"SECRETARY\"\n            }\n        ],\n        \"businessFacts\": {\n            \"fileEstablishedDate\": \"1987-10-01\",\n            \"fileEstablishedFlag\": {},\n            \"stateOfIncorporation\": \"GA\",\n            \"dateOfIncorporation\": \"1979-03-10\",\n            \"businessType\": \"Corporation\",\n            \"yearsInBusinessIndicator\": {\n                \"code\": \"A\",\n                \"definition\": \"Under 1 Year\"\n            },\n            \"publicIndicator\": false,\n            \"nonProfitIndicator\": false\n        },\n        \"corporateLinkage\": [\n            {\n                \"businessName\": \"ANTHONY PROPERTIES, INC\",\n                \"bin\": \"725227333\",\n                \"matchingBusinessIndicator\": true,\n                \"address\": {\n                    \"street\": \"PO BOX 1055\",\n                    \"city\": \"ROSWELL\",\n                    \"state\": \"GA\",\n                    \"country\": \"   \"\n                },\n                \"returnLimitExceeded\": false,\n                \"type\": \"Ultimate Parent\"\n            },\n            {\n                \"businessName\": \"ANTHONY PROPERTIES, INC\",\n                \"bin\": \"730551236\",\n                \"matchingBusinessIndicator\": false,\n                \"address\": {\n                    \"street\": \"12265 KING CIR\",\n                    \"city\": \"ROSWELL\",\n                    \"state\": \"GA\",\n                    \"country\": \"USA\"\n                },\n                \"returnLimitExceeded\": false,\n                \"type\": \"Branch\"\n            }\n        ],\n        \"commercialFraudShieldSummary\": {\n            \"matchingBusinessIndicator\": \"Primary Business\",\n            \"activeBusinessIndicator\": true,\n            \"ofacMatchWarning\": {\n                \"code\": 1,\n                \"definition\": \"No Match Found\"\n            },\n            \"businessVictimStatementIndicator\": false,\n            \"businessRiskTriggersIndicator\": false,\n            \"nameAddressVerificationIndicator\": true,\n            \"businessRiskTriggersStatement\": []\n        },\n        \"expandedCreditSummary\": {\n            \"currentAccountBalance\": 299100,\n            \"currentTradelineCount\": 2,\n            \"monthlyAverageDbt\": 0,\n            \"highestDbt6Months\": 0,\n            \"highestDbt5Quarters\": 0,\n            \"activeTradelineCount\": 2,\n            \"allTradelineBalance\": 299100,\n            \"allTradelineCount\": 2,\n            \"averageBalance5Quarters\": 54500,\n            \"singleHighCredit\": 299100,\n            \"highBalance6Months\": 299100,\n            \"currentDbt\": 0,\n            \"bankruptcyIndicator\": false,\n            \"judgmentIndicator\": false,\n            \"taxLienIndicator\": false,\n            \"tradeCollectionCount\": 2,\n            \"tradeCollectionBalance\": 299100,\n            \"ofacMatchWarning\": {\n                \"code\": \"N\",\n                \"definition\": \"This business did not match to OFAC\"\n            },\n            \"victimStatementIndicator\": false,\n            \"commercialFraudRiskIndicatorCount\": 0\n        },\n        \"executiveSummary\": {\n            \"highestTotalAccountBalance\": {\n                \"amount\": 299100\n            },\n            \"currentTotalAccountBalance\": {\n                \"amount\": 299100\n            },\n            \"highCreditAmountExtended\": 299100,\n            \"businessDbt\": {\n                \"code\": 0,\n                \"definition\": \"Good Risk. 80% of businesses fall into this range\"\n            },\n            \"predictedDbt\": 1,\n            \"predictedDbtDate\": \"2025-09-06\",\n            \"allIndustryDbt\": 3,\n            \"industryPaymentComparison\": {},\n            \"paymentTrendIndicator\": {\n                \"code\": \"N\",\n                \"definition\": \"No Trend Identifiable\"\n            },\n            \"commonTerms\": {}\n        },\n        \"inquiries\": [],\n        \"competitors\": [],\n        \"proprietorNameAndAddress\": [],\n        \"uccCoDebtors\": [],\n        \"sicCodes\": [\n            {}\n        ],\n        \"naicsCodes\": [\n            {}\n        ],\n        \"scoreInformation\": {\n            \"fsrScore\": {\n                \"publiclyHeldCompany\": false,\n                \"limitedProfile\": false,\n                \"score\": 30,\n                \"profileNumber\": \"I418752592\",\n                \"modelCode\": \"000223\",\n                \"modelTitle\": \"FINANCIAL STABILITY RISK\",\n                \"percentileRanking\": 29,\n                \"riskClass\": {\n                    \"code\": 3,\n                    \"definition\": \"MEDIUM RISK\"\n                },\n                \"customerDisputeIndicator\": false\n            },\n            \"commercialScore\": {\n                \"publiclyHeldCompany\": false,\n                \"limitedProfile\": false,\n                \"score\": 70,\n                \"profileNumber\": \"I418752592\",\n                \"modelCode\": \"000224\",\n                \"modelTitle\": \"INTELLISCORE PLUS V2\",\n                \"percentileRanking\": 69,\n                \"riskClass\": {\n                    \"code\": 2,\n                    \"definition\": \"LOW TO MEDIUM RISK\"\n                },\n                \"customerDisputeIndicator\": false,\n                \"customModelCode\": \"05\",\n                \"recommendedCreditLimitAmount\": 103100\n            },\n            \"fsrScoreFactors\": [\n                {\n                    \"code\": \"009\",\n                    \"definition\": \"NUMBER OF ACTIVE COMMERCIAL ACCOUNTS\"\n                },\n                {\n                    \"code\": \"004\",\n                    \"definition\": \"RISK ASSOCIATED WITH THE COMPANY'S INDUSTRY SECTOR\"\n                },\n                {\n                    \"code\": \"013\",\n                    \"definition\": \"BALANCE TO HIGH CREDIT RATIO FOR COMMERCIAL ACCOUNTS\"\n                },\n                {\n                    \"code\": \"002\",\n                    \"definition\": \"RISK ASSOCIATED WITH THE BUSINESS TYPE\"\n                }\n            ],\n            \"commercialScoreFactors\": [\n                {\n                    \"code\": \"002\",\n                    \"definition\": \"NUMBER OF RECENTLY ACTIVE COMMERCIAL ACCOUNTS\"\n                },\n                {\n                    \"code\": \"063\",\n                    \"definition\": \"RATIO OF TOTAL BAL TO TOTAL HIGH BAL ACROSS ALL COMM ACCTS\"\n                },\n                {\n                    \"code\": \"050\",\n                    \"definition\": \"NUMBER OF COMMERCIAL ACCOUNTS WITH HIGH UTILIZATION\"\n                }\n            ],\n            \"fsrScoreTrends\": [\n                {\n                    \"quarter\": \"JAN-MAR\",\n                    \"score\": 46\n                },\n                {\n                    \"quarter\": \"OCT-DEC\",\n                    \"score\": 54\n                },\n                {\n                    \"quarter\": \"JUL-SEP\",\n                    \"score\": 54\n                },\n                {\n                    \"quarter\": \"APR-JUN\",\n                    \"score\": 46\n                }\n            ],\n            \"commercialScoreTrends\": [\n                {\n                    \"quarter\": \"JAN-MAR\",\n                    \"score\": 89\n                },\n                {\n                    \"quarter\": \"OCT-DEC\",\n                    \"score\": 98\n                },\n                {\n                    \"quarter\": \"JUL-SEP\",\n                    \"score\": 97\n                },\n                {\n                    \"quarter\": \"APR-JUN\",\n                    \"score\": 93\n                }\n            ]\n        },\n        \"corporateFinancialInformation\": {\n            \"balanceSheets\": [],\n            \"operatingStatements\": [],\n            \"criticalDataAndFinancialRatios\": []\n        },\n        \"consumerStatement\": [],\n        \"economicDiversity\": {\n            \"minorityOwnedIndicator\": false,\n            \"womenOwnedIndicator\": false,\n            \"disadvantagedIndicator\": false,\n            \"sbaCertifiedIndicator\": false,\n            \"sba8aIndicator\": false,\n            \"hubZoneIndicator\": false,\n            \"veteranOwnedIndicator\": false,\n            \"disabledVeteranOwnedIndicator\": false,\n            \"historicalBlackCollegeAndUniversitiesIndicator\": false\n        },\n        \"governmentActivity\": {\n            \"congressionalDistrict\": \"6\"\n        },\n        \"contractSpendingDetail\": [],\n        \"leasingInformation\": [],\n        \"licenseDetails\": [],\n        \"bondDetails\": [],\n        \"insuranceDetails\": [],\n        \"stocks\": {},\n        \"commercialBankInformation\": []\n    }\n}"
                }
              ]
            },
            {
              "name": "[Step 3]: PDF Business Premier Profile Report",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "console.log(pm.iterationData);",
                      "if(pm.iterationData) {",
                      "    console.log(pm.response.headers.get(\"RequestID\"));",
                      "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                      "}",
                      ""
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                }
              ],
              "request": {
                "auth": {
                  "type": "bearer",
                  "bearer": [
                    {
                      "key": "token",
                      "value": "{{utoken}}",
                      "type": "string"
                    }
                  ]
                },
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                  },
                  {
                    "key": "Accept",
                    "value": "application/pdf",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"bin\": \"412123923\",\n    \"modelCode\": \"000250\"\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/ccc/exp/report/pdf/{{RequestID}}",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "ccc",
                    "exp",
                    "report",
                    "pdf",
                    "{{RequestID}}"
                  ]
                },
                "description": "Given the BIN retrieved from step 1, this endpoint pulls the Experian Business Premier Profile report asciated with that BIN."
              },
              "response": []
            }
          ],
          "description": "### Order **Experian Business Premier Profile Report**\n\n### **Step 1: Business Identification Number Search**\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/ccc/exp/search`\n\n- This endpoint searches for the business submitted in the request body to provide the target \"bin\" value for subsequent endpoints.\n    \n\n### **Step 2: Generate JSON Business Premier Profile Report**\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/ccc/exp/report`\n\n- This endpoint returns the Premier Profile Report for the \"bin\" value submitted in the request body.\n    \n- The response includes a `RequestID` header — capture this value for the next step.\n    \n- Please note that this request is a billable event. You are billed for each \"bin\" value that is submitted in the request regarless of how many \"bin\" values returned for a business identity in step 1.\n    \n\n### **Step 3: Generate PDF Business Premier Profile Report**\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/ccc/exp/report/pdf/{RequestID}`\n\n- Returns a PDF version of the report from Step 1.\n    \n- Use the same {config} and RequestID values.\n    \n- Wait about 200 ms after Step 1 before calling Step 2 to ensure data is available.\n    \n- Request the PDF within 24 hours to ensure a single inquiry.\n    \n\n#### Field Documentation\n\n- [Experian Business Premier Profile Upstream OpenAPI.yaml](https://crsgroupinc.egnyte.com/dl/dHxJfRGKRVRW/experian-business-premier-profile-upstream-openapi.yaml_)\n    \n- [Testcases - Experian Business.txt](https://crsgroupinc.egnyte.com/dl/ebPg1rYGHt/Testcases_-_Experian_Business.txt_)\n    \n- [Testcases - Experian BIN Values.txt](https://crsgroupinc.egnyte.com/dl/bfY9pw3K9pwC/Testcases_-_Experian_BIN_Values.txt_)"
        },
        {
          "name": "Comprehensive Business Report (Top Business Report)",
          "item": [
            {
              "name": "[Step 1] TopBusinessSearch",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "const header1 = pm.response.headers.get('RequestID');",
                      "if(header1) pm.environment.set(\"requestid\", header1);"
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                }
              ],
              "request": {
                "auth": {
                  "type": "bearer",
                  "bearer": [
                    {
                      "key": "token",
                      "value": "{{utoken}}",
                      "type": "string"
                    }
                  ]
                },
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json"
                  },
                  {
                    "key": "Cache-Control",
                    "value": "no-cache",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"companyName\": \"1BASELAM, INC\",\n    \"streetAddress\": \"3646 RIVER HEIGHTS XING\",\n    \"city\": \"MARIETTA\",\n    \"state\": \"GA\",\n    \"zipCode\": \"30067\",\n    \"seleId\": 1928983913\n}\n",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/top-business-search/top-business-search",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "top-business-search",
                    "top-business-search"
                  ]
                }
              },
              "response": []
            },
            {
              "name": "[Step 2] JSON TopBusinessReport",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "const header1 = pm.response.headers.get('RequestID');",
                      "if(header1) pm.environment.set(\"requestid\", header1);"
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                }
              ],
              "request": {
                "auth": {
                  "type": "bearer",
                  "bearer": [
                    {
                      "key": "token",
                      "value": "{{utoken}}",
                      "type": "string"
                    }
                  ]
                },
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json"
                  },
                  {
                    "key": "Cache-Control",
                    "value": "no-cache",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"seleID\": 1928983913,\n    \"orgID\": 1928983913,\n    \"ultID\": 1928983913\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/top-business-report/top-business-report",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "top-business-report",
                    "top-business-report"
                  ]
                }
              },
              "response": []
            },
            {
              "name": "[Step 2] PDF TopBusinessReport",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "const header1 = pm.response.headers.get('RequestID');",
                      "if(header1) pm.environment.set(\"requestid\", header1);"
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                }
              ],
              "request": {
                "auth": {
                  "type": "bearer",
                  "bearer": [
                    {
                      "key": "token",
                      "value": "{{utoken}}",
                      "type": "string"
                    }
                  ]
                },
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/pdf"
                  },
                  {
                    "key": "Cache-Control",
                    "value": "no-cache",
                    "type": "text"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"seleID\": 1928983913,\n    \"orgID\": 1928983913,\n    \"ultID\": 1928983913\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/top-business-report/pdf/top-business-report",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "top-business-report",
                    "pdf",
                    "top-business-report"
                  ]
                }
              },
              "response": []
            }
          ]
        }
      ]
    },
    {
      "name": "Public Record Data",
      "item": [
        {
          "name": "CIC Reports",
          "item": [
            {
              "name": "Criminal",
              "item": [
                {
                  "name": "[Step 1] JSON Criminal Report",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if (data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"cic_criminal_responseID\", data.orderResponse.responseID);",
                          "",
                          "}"
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [],
                    "body": {
                      "mode": "raw",
                      "raw": "{\r\n    \"propertyZip\": \"60657\",\r\n    \"subjectInfo\": {\r\n        \"last\": \"Consumer\",\r\n        \"first\": \"Jonathan\",\r\n        \"middle\": \"\",\r\n        \"dob\": \"01-01-1982\",\r\n        \"ssn\": \"666-44-3321\",\r\n        \"houseNumber\": \"1803\",\r\n        \"streetName\": \"Norma\",\r\n        \"city\": \"Cottonwood\",\r\n        \"state\": \"CA\",\r\n        \"zip\": \"91502\",\r\n        \"houseNumber2\": \"1803\",\r\n        \"streetName2\": \"Norma\",\r\n        \"city2\": \"Cottonwood\",\r\n        \"state2\": \"CA\",\r\n        \"zip2\": \"91502\",\r\n        \"houseNumber3\": \"1803\",\r\n        \"streetName3\": \"Norma\",\r\n        \"city3\": \"Cottonwood\",\r\n        \"state3\": \"CA\",\r\n        \"zip3\": \"91502\",\r\n        \"houseNumber4\": \"1803\",\r\n        \"streetName4\": \"Norma\",\r\n        \"city4\": \"Cottonwood\",\r\n        \"state4\": \"CA\",\r\n        \"zip4\": \"91502\",\r\n        \"houseNumber5\": \"1803\",\r\n        \"streetName5\": \"Norma\",\r\n        \"city5\": \"Cottonwood\",\r\n        \"state5\": \"CA\",\r\n        \"zip5\": \"91502\",\r\n        \"houseNumber6\": \"1803\",\r\n        \"streetName6\": \"Norma\",\r\n        \"city6\": \"Cottonwood\",\r\n        \"state6\": \"CA\",\r\n        \"zip6\": \"91502\"\r\n    }\r\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/criminal/new-request",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "criminal",
                        "new-request"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF Criminal Report",
                  "request": {
                    "method": "GET",
                    "header": [
                      {
                        "key": "Accept",
                        "value": "application/pdf",
                        "type": "text"
                      }
                    ],
                    "url": {
                      "raw": "{{baseUrl}}/criminal/new-pdf-request/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "criminal",
                        "new-pdf-request",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "Get Criminal Report",
                  "protocolProfileBehavior": {
                    "disableBodyPruning": true
                  },
                  "request": {
                    "method": "GET",
                    "header": [],
                    "body": {
                      "mode": "raw",
                      "raw": "{\r\n    \"reference\": \"myRef123\",\r\n    \"subjectInfo\": {\r\n        \"last\": \"Consumer\",\r\n        \"first\": \"Jonathan\",\r\n        \"middle\": \"\",\r\n        \"dob\": \"01-01-1982\",\r\n        \"ssn\": \"666-44-3321\",\r\n        \"houseNumber\": \"1803\",\r\n        \"streetName\": \"Norma\",\r\n        \"city\": \"Cottonwood\",\r\n        \"state\": \"CA\",\r\n        \"zip\": \"91502\"\r\n    }\r\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/criminal/get-response/{{cic_criminal_responseID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "criminal",
                        "get-response",
                        "{{cic_criminal_responseID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ]
            },
            {
              "name": "Eviction",
              "item": [
                {
                  "name": "[Step 1] JSON Eviction Report",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if (data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"cic_eviction_responseID\", data.orderResponse.responseID);",
                          "",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"propertyZip\": \"60657\",\n    \"subjectInfo\": {\n        \"last\": \"Chuang\",\n        \"first\": \"Harold\",\n        \"middle\": \"\",\n        \"dob\": \"01-01-1982\",\n        \"ssn\": \"666-44-3321\",\n        \"houseNumber\": \"1803\",\n        \"streetName\": \"Norma\",\n        \"city\": \"Cottonwood\",\n        \"state\": \"CA\",\n        \"zip\": \"91502\",\n        \"houseNumber2\": \"1803\",\n        \"streetName2\": \"Norma\",\n        \"city2\": \"Cottonwood\",\n        \"state2\": \"CA\",\n        \"zip2\": \"91502\",\n        \"houseNumber3\": \"1803\",\n        \"streetName3\": \"Norma\",\n        \"city3\": \"Cottonwood\",\n        \"state3\": \"CA\",\n        \"zip3\": \"91502\",\n        \"houseNumber4\": \"1803\",\n        \"streetName4\": \"Norma\",\n        \"city4\": \"Cottonwood\",\n        \"state4\": \"CA\",\n        \"zip4\": \"91502\",\n        \"houseNumber5\": \"1803\",\n        \"streetName5\": \"Norma\",\n        \"city5\": \"Cottonwood\",\n        \"state5\": \"CA\",\n        \"zip5\": \"91502\",\n        \"houseNumber6\": \"1803\",\n        \"streetName6\": \"Norma\",\n        \"city6\": \"Cottonwood\",\n        \"state6\": \"CA\",\n        \"zip6\": \"91502\"\n    }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/eviction/new-request",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "eviction",
                        "new-request"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF Eviction Report",
                  "request": {
                    "method": "GET",
                    "header": [
                      {
                        "key": "Accept",
                        "value": "application/pdf",
                        "type": "text"
                      }
                    ],
                    "url": {
                      "raw": "{{baseUrl}}/eviction/new-pdf-request/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "eviction",
                        "new-pdf-request",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "Get Eviction Report",
                  "protocolProfileBehavior": {
                    "disableBodyPruning": true
                  },
                  "request": {
                    "method": "GET",
                    "header": [],
                    "body": {
                      "mode": "raw",
                      "raw": "{\r\n    \"reference\": \"myRef123\",\r\n    \"subjectInfo\": {\r\n        \"last\": \"Consumer\",\r\n        \"first\": \"Jonathan\",\r\n        \"middle\": \"\",\r\n        \"dob\": \"01-01-1982\",\r\n        \"ssn\": \"666-44-3321\",\r\n        \"houseNumber\": \"1803\",\r\n        \"streetName\": \"Norma\",\r\n        \"city\": \"Cottonwood\",\r\n        \"state\": \"CA\",\r\n        \"zip\": \"91502\"\r\n    }\r\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/criminal/get-response/{{cic_eviction_responseID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "criminal",
                        "get-response",
                        "{{cic_eviction_responseID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ]
            }
          ],
          "description": "The CIC Reports API supports both Eviction and Criminal report types using a shared endpoint pattern. Specify `{report}` as either `eviction` or `criminal` depending on which report you are requesting.\n\n### **Step 1: Order Report**\n\n**POST**\n\n**`https://api-sandbox.stitchcredit.com/api/{report}/new-request`**\n\n- Returns a JSON CIC report for the identity submitted in the request body.\n    \n- The response includes a `RequestID` header — capture this value for the next step\n    \n- To apply **tenant screening regulation filtering**, include `\"propertyZip\"` with the ZIP code of the property being applied for.\n    \n\n### **Step 2: Generate PDF Report**\n\n**GET**\n\n**`https://api-sandbox.stitchcredit.com/api/{report}/new-pdf-request/{RequestID}`**\n\n- Returns a PDF version of the report from Step 1.\n    \n- Use the same `{config}` and `RequestID` values.\n    \n- Wait about **200 ms** after Step 1 before calling Step 2 to ensure data is available.\n    \n- Request the PDF within **24 hours** to ensure a single inquiry.\n    \n\n### **Inquiry Review Scenarios**\n\nIn certain inquiry attempts, manual intervention by CIC may be required to update a record or permit order fulfillment.\n\nWhen this occurs, you’ll receive a response similar to the following:\n\n``` json\n{\n  \"orderResponse\": {\n    \"message\": \"This applicant cannot be conducted through the automated system at this time. Please contact Customer Service.\",\n    \"responseID\": \"91919191\",\n    \"name\": \"SMITH,KEVIN\"\n  }\n}\n\n ```\n\nThis message indicates that CIC must manually review or update the record — typically due to local tenant-screening regulations affecting items in the report.  \nOur system reaches out to CIC to have them update the file in these cases. Once CIC completes the update, you can retrieve the finalized report using the **get-response** endpoint.\n\n### **Step 3: Retrieve Updated Report**\n\n**GET****`https://api-sandbox.stitchcredit.com/api/{report}/get-response/{responseID}`**\n\n- Use the `responseID` from Step 1.\n    \n- You may **poll this endpoint** periodically until the updated data becomes available.\n    \n\n#### Field Documentation\n\n- [CIC Eviction Report Data Definitions (PDF)](https://crsgroupinc.egnyte.com/dl/yCMBICtVjd/CIC_Eviction_Report_Data_Definitions.pdf_)\n    \n- [Test Cases – CIC Eviction Report (TXT)](https://crsgroupinc.egnyte.com/dl/N3gqh9MpxL/Testcases_-_CIC_Eviction_Report.txt_)\n    \n- [CIC Criminal Report Data Definitions (PDF)](https://crsgroupinc.egnyte.com/dl/RHm029W55x/CIC_Criminal_Report_Data_Definitions.pdf_)\n    \n- [Test Cases – CIC Criminal Report (TXT)](https://crsgroupinc.egnyte.com/dl/IrDXscci4Z/Testcases_-_CIC_Criminal_Report.txt_)"
        },
        {
          "name": "PitchPoint",
          "item": [
            {
              "name": "Bankruptcy, Liens, and Judgements",
              "item": [
                {
                  "name": "FCRA",
                  "item": [
                    {
                      "name": "[XML & PDF] PitchPoint Bankruptcies, Liens, and Judgments",
                      "event": [
                        {
                          "listen": "test",
                          "script": {
                            "exec": [
                              "var data = pm.response.json();",
                              "if(data) {",
                              "    console.log(pm.response.headers.get(\"RequestID\"));",
                              "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                              "}",
                              ""
                            ],
                            "type": "text/javascript",
                            "packages": {},
                            "requests": {}
                          }
                        }
                      ],
                      "request": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"terms\": {\n        \"term\": [\n            {\n                \"person\": {\n                    \"firstName\": \"Marisol\",\n                    \"lastName\": \"Testcase\",\n                    \"ssn\": \"000000001\"\n                }\n            }\n        ]\n    }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{baseUrl}}/pp/fcrablj",
                          "host": [
                            "{{baseUrl}}"
                          ],
                          "path": [
                            "pp",
                            "fcrablj"
                          ]
                        },
                        "description": "This endpoint will retrieve PitchPoint Combined XML + PDF version for bankruptcies, liens, and judgments."
                      },
                      "response": []
                    },
                    {
                      "name": "[PDF Only] PitchPoint Bankruptcies, Liens, and Judgments",
                      "event": [
                        {
                          "listen": "test",
                          "script": {
                            "exec": [
                              "var data = pm.response;",
                              "if(data) {",
                              "    console.log(pm.response.headers.get(\"RequestID\"));",
                              "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                              "}",
                              ""
                            ],
                            "type": "text/javascript",
                            "packages": {},
                            "requests": {}
                          }
                        }
                      ],
                      "request": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/pdf"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"terms\": {\n        \"term\": [\n            {\n                \"person\": {\n                    \"firstName\": \"Marisol\",\n                    \"lastName\": \"Testcase\",\n                    \"ssn\": \"000000001\"\n                }\n            }\n        ]\n    }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{baseUrl}}/pp/fcrablj/pdf",
                          "host": [
                            "{{baseUrl}}"
                          ],
                          "path": [
                            "pp",
                            "fcrablj",
                            "pdf"
                          ]
                        },
                        "description": "This endpoint will retrieve PitchPoint PDF version for bankruptcies, liens, and judgments."
                      },
                      "response": []
                    },
                    {
                      "name": "[JSON Only] PitchPoint Bankruptcies, Liens, and Judgments",
                      "event": [
                        {
                          "listen": "test",
                          "script": {
                            "exec": [
                              "var data = pm.response.json();",
                              "if(data) {",
                              "    console.log(pm.response.headers.get(\"RequestID\"));",
                              "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                              "}",
                              ""
                            ],
                            "type": "text/javascript",
                            "packages": {},
                            "requests": {}
                          }
                        }
                      ],
                      "request": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "*/*"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"terms\": {\n        \"term\": [\n            {\n                \"person\": {\n                    \"firstName\": \"Marisol\",\n                    \"lastName\": \"Testcase\",\n                    \"ssn\": \"000000001\"\n                }\n            }\n        ]\n    }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{baseUrl}}/pp/fcrablj/data",
                          "host": [
                            "{{baseUrl}}"
                          ],
                          "path": [
                            "pp",
                            "fcrablj",
                            "data"
                          ]
                        },
                        "description": "This endpoint will retrieve PitchPoint XML version for bankruptcies, liens, and judgments."
                      },
                      "response": []
                    }
                  ],
                  "description": "**Permissible purpose:** This mode requires a certified permissible purpose, applicable consumer authorization, and adherence to pre-adverse/adverse action and dispute procedures.\n\n### Order PitchPoint Person Civil Court Search for Bankruptcies, Liens, and Judgement\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/fcrablj`\n\n- This endpoint returns embedded XML and base64 encoded PDF data in the response.\n    \n- Use this endpoint if parsable data and a PDF is needed for the same order.\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/fcrablj/pdf`\n\n- Use this endpoint if only the PDF data is needed for the order.\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/fcrablj/data`\n\n- Use this endpoint if only the parsable data is needed for the order."
                },
                {
                  "name": "GLBA",
                  "item": [
                    {
                      "name": "[XML & PDF] PitchPoint Bankruptcies, Liens, and Judgments",
                      "request": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n  \"terms\": {\n    \"term\": [\n      {\n        \"person\": {\n          \"firstName\": \"Kelly\",\n          \"lastName\": \"Russell\",\n          \"ssn\": \"000111000\"\n        }\n      }\n    ]\n  }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{baseUrl}}/pp/glbblj",
                          "host": [
                            "{{baseUrl}}"
                          ],
                          "path": [
                            "pp",
                            "glbblj"
                          ]
                        },
                        "description": "This endpoint will retrieve PitchPoint Combined XML + PDF version for bankruptcies, liens, and judgments."
                      },
                      "response": []
                    },
                    {
                      "name": "[PDF Only] PitchPoint Bankruptcies, Liens, and Judgments",
                      "request": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/pdf"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n  \"terms\": {\n    \"term\": [\n      {\n        \"person\": {\n          \"firstName\": \"Kelly\",\n          \"lastName\": \"Russell\",\n          \"ssn\": \"000111000\"\n        }\n      }\n    ]\n  }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{baseUrl}}/pp/glbblj/pdf",
                          "host": [
                            "{{baseUrl}}"
                          ],
                          "path": [
                            "pp",
                            "glbblj",
                            "pdf"
                          ]
                        },
                        "description": "This endpoint will retrieve PitchPoint PDF version for bankruptcies, liens, and judgments."
                      },
                      "response": []
                    },
                    {
                      "name": "[JSON Only] PitchPoint Bankruptcies, Liens, and Judgments",
                      "request": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "*/*"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"terms\": {\n        \"term\": [\n            {\n                \"person\": {\n                    \"firstName\": \"Marisol\",\n                    \"lastName\": \"Testcase\",\n                    \"ssn\": \"000000001\"\n                }\n            }\n        ]\n    }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{baseUrl}}/pp/glbblj/data",
                          "host": [
                            "{{baseUrl}}"
                          ],
                          "path": [
                            "pp",
                            "glbblj",
                            "data"
                          ]
                        },
                        "description": "This endpoint will retrieve PitchPoint XML version for bankruptcies, liens, and judgments."
                      },
                      "response": []
                    }
                  ],
                  "description": "**Processing purpose (GLBA):** This mode is governed by GLBA Privacy/Safeguards (notice/opt-out as applicable, security program, vendor oversight) and is **not** for FCRA adverse-action decisioning.\n\n### Order PitchPoint Person Civil Court Search for Bankruptcies, Liens, and Judgements\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/glbblj`\n\n- This endpoint returns embedded XML and base64 encoded PDF data in the response.\n    \n- Use this endpoint if parsable data and a PDF is needed for the same order.\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/glbblj/pdf`\n\n- Use this endpoint if only the PDF data is needed for the order.\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/glbblj/data`\n\n- Use this endpoint if only the parsable data is needed for the order."
                }
              ]
            },
            {
              "name": "Foreclosure",
              "item": [
                {
                  "name": "[XML & PDF] PitchPoint Foreclosure Search",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"terms\": {\n        \"term\": [\n            {\n                \"person\": {\n                    \"firstName\": \"Laura\",\n                    \"lastName\": \"Juarez\",\n                    \"ssn\": \"555110697\",\n                    \"dob\": \"02/13/1971\"\n                }\n            }\n        ]\n    }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/pp/foreclosure",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "pp",
                        "foreclosure"
                      ]
                    },
                    "description": "This endpoint will retrieve PitchPoint Combined XML + PDF version for foreclosure search."
                  },
                  "response": []
                },
                {
                  "name": "[PDF Only] PitchPoint Foreclosure Search",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n  \"terms\": {\n    \"term\": [\n      {\n        \"person\": {\n          \"firstName\": \"Laura\",\n          \"lastName\": \"Juarez\",\n          \"ssn\": \"555110697\",\n          \"dob\": \"02/13/1971\"\n        }\n      }\n    ]\n  }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/pp/foreclosure/pdf",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "pp",
                        "foreclosure",
                        "pdf"
                      ]
                    },
                    "description": "This endpoint will retrieve PitchPoint PDF version for foreclosure search."
                  },
                  "response": []
                },
                {
                  "name": "[JSON Only] PitchPoint Foreclosure Search",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "*/*"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n  \"terms\": {\n    \"term\": [\n      {\n        \"person\": {\n          \"firstName\": \"Laura\",\n          \"lastName\": \"Juarez\",\n          \"ssn\": \"555110697\",\n          \"dob\": \"02/13/1971\"\n        }\n      }\n    ]\n  }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/pp/foreclosure/data",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "pp",
                        "foreclosure",
                        "data"
                      ]
                    },
                    "description": "This endpoint will retrieve PitchPoint XML version for foreclosure search."
                  },
                  "response": []
                }
              ],
              "description": "### Order PitchPoint Person Civil Court Search for Foreclosures\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/foreclosure`\n\n- This endpoint returns embedded XML and base64 encoded PDF data in the response.\n    \n- Use this endpoint if parsable data and a PDF is needed for the same order.\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/foreclosure/pdf`\n\n- Use this endpoint if only the PDF data is needed for the order.\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/foreclosure/data`\n\n- Use this endpoint if only the parsable data is needed for the order."
            },
            {
              "name": "Property",
              "item": [
                {
                  "name": "[XML & PDF] PitchPoint Property Report",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n  \"terms\": {\n    \"term\": [\n      {\n        \"property\": {\n          \"address\": {\n            \"addressLine1\": \"19 Brisa Del Lago\",\n            \"city\": \"Rancho Santa Margarita\",\n            \"postalCode\": \"92688\",\n            \"state\": \"CA\"\n          }\n        }\n      }\n    ]\n  }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/pp/property",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "pp",
                        "property"
                      ]
                    },
                    "description": "This endpoint will retrieve PitchPoint Combined XML + PDF version for the property."
                  },
                  "response": []
                },
                {
                  "name": "[PDF Only] PitchPoint Property Report",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n  \"terms\": {\n    \"term\": [\n      {\n        \"property\": {\n          \"address\": {\n            \"addressLine1\": \"19 Brisa Del Lago\",\n            \"city\": \"Rancho Santa Margarita\",\n            \"postalCode\": \"92688\",\n            \"state\": \"CA\"\n          }\n        }\n      }\n    ]\n  }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/pp/property/pdf",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "pp",
                        "property",
                        "pdf"
                      ]
                    },
                    "description": "This endpoint will retrieve PitchPoint PDF version for the property."
                  },
                  "response": []
                },
                {
                  "name": "[Data Only] PitchPoint Property Report",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n  \"terms\": {\n    \"term\": [\n      {\n        \"property\": {\n          \"address\": {\n            \"addressLine1\": \"19 Brisa Del Lago\",\n            \"city\": \"Rancho Santa Margarita\",\n            \"postalCode\": \"92688\",\n            \"state\": \"CA\"\n          }\n        }\n      }\n    ]\n  }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/pp/property/data",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "pp",
                        "property",
                        "data"
                      ]
                    },
                    "description": "This endpoint will retrieve PitchPoint JSON/XML version for the property."
                  },
                  "response": []
                }
              ],
              "description": "### Order PitchPoint Property Report\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/property`\n\n- This endpoint returns embedded XML and base64 encoded PDF data in the response.\n    \n- Use this endpoint if parsable data and a PDF is needed for the same order.\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/property/pdf`\n\n- Use this endpoint if only the PDF data is needed for the order.\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/pp/property/data`\n\n- Use this endpoint if only the parsable data is needed for the order."
            }
          ]
        },
        {
          "name": "LexisNexis",
          "item": [
            {
              "name": "LexisNexis Bridger XGS - OFAC Search",
              "item": [
                {
                  "name": "LexisNexis Bridger XGS - OFAC Search",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "if(data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"glbPurpose\": \"0\",\n    \"dlPurpose\": \"0\",\n    \"searchType\": \"NMS_PEP_OFAC_SANC\",\n    \"input\": {\n        \"records\": {\n            \"inputRecord\": [\n                {\n                    \"entity\": {\n                        \"name\": {\n                            \"first\": \"Yacine\",\n                            \"middle\": \"AHMED\",\n                            \"last\": \"NACER\"\n                        },\n                        \"additionalInfo\": {\n                            \"inputAdditionalInfo\": [\n                                {\n                                    \"date\": {\n                                        \"year\": 1967,\n                                        \"month\": 12,\n                                        \"day\": 2\n                                    },\n                                    \"type\": \"DOB\"\n                                },\n                                {\n                                    \"value\": \"Algeria\",\n                                    \"type\": \"PLACE_OF_BIRTH\"\n                                }\n                            ]\n                        },\n                        \"entityType\": \"INDIVIDUAL\"\n                    }\n                }\n            ]\n        }\n    }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/xgs/search",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "xgs",
                        "search"
                      ]
                    }
                  },
                  "response": []
                }
              ],
              "description": "**LexisNexis Bridger XGS OFAC Search**\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/xgs/search`\n\n- This endpoint returns a LexisNexis Bridger XGS OFAC Search for the identity submitted in the request body.\n    \n- If no match is found, then the response body is: `{\"searchEngineVersion\": \"5.91.16.0\"}`\n    \n\n**Documentation**\n\n- [LexisNexis Bridger XGS OFAC Search Data Definitions.pdf](https://crsgroupinc.egnyte.com/dl/grVR8bRxxXtw/CRS_API__LexisNexis_Bridger_XGS_-_OFAC_Search_-_Data_Definitions.pdf_)\n    \n- [Testcases - LexisNexis Bridger XGS OFAC Search.txt](https://crsgroupinc.egnyte.com/dl/JPkvg6fdkmjH/Testcases_-_LexisNexis_Bridger_XGS_OFAC_Search.txt_)"
            },
            {
              "name": "LexisNexis Risk View Liens & Judgements",
              "item": [
                {
                  "name": "JSON Risk View Liens & Judgements Report",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n  \"firstName\": \"JAMES\",\n  \"lastName\": \"AFLAGUE\",\n  \"middleName\": \"\",\n  \"street1\": \"4055 HARTEL ST\",\n  \"city\": \"BEAUMONT\",\n  \"zip\": \"77705\",\n  \"state\": \"TX\",\n  \"phone\": \"2255708954\",\n  \"dob\": \"\",\n  \"ssn\": \"032680582\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/riskview/liens-and-judgements/ln-lnj",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "riskview",
                        "liens-and-judgements",
                        "ln-lnj"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "PDF Risk View Liens & Judgements Report",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n  \"firstName\": \"JAMES\",\n  \"lastName\": \"AFLAGUE\",\n  \"middleName\": \"\",\n  \"street1\": \"4055 HARTEL ST\",\n  \"city\": \"BEAUMONT\",\n  \"zip\": \"77705\",\n  \"state\": \"TX\",\n  \"phone\": \"2255708954\",\n  \"dob\": \"\",\n  \"ssn\": \"032680582\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/riskview/liens-and-judgements/pdf/ln-lnj",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "riskview",
                        "liens-and-judgements",
                        "pdf",
                        "ln-lnj"
                      ]
                    }
                  },
                  "response": []
                }
              ],
              "description": "## Order RiskView Liens & Judgments JSON\n\n**POST**  \n`https://api-sandbox.stitchcredit.com/api/riskview/liens-and-judgements/ln-lnj`\n\n- This endpoint retrieves a JSON response of the RiskView Report\n    \n\n---\n\n## Order RiskView Liens & Judgments PDF\n\n**POST**  \n`https://api-sandbox.stitchcredit.com/api/riskview/liens-and-judgements/pdf/ln-lnj`\n\n- This endpoint retrieves a JSON response of the RiskView Report\n    \n\n**Documentation**\n\n- [Testcases - LexisNexis Risk View.txt](https://crsgroupinc.egnyte.com/dl/Zhuym4gdQD/LexisNexis_Risk_View_Testcases.txt_)"
            }
          ]
        }
      ]
    },
    {
      "name": "Consumer Credit Report",
      "item": [
        {
          "name": "TransUnion",
          "item": [
            {
              "name": "tu-prequal-vantage4",
              "item": [
                {
                  "name": "[Step 1] JSON Credit Order",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "//console.log(data);",
                          "if(data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/transunion/credit-report/standard/tu-prequal-vantage4",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "transunion",
                        "credit-report",
                        "standard",
                        "tu-prequal-vantage4"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/transunion/standard-credit-report/pdf/tu-prequal-vantage4/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "transunion",
                        "standard-credit-report",
                        "pdf",
                        "tu-prequal-vantage4",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 3] JSON Credit Retrieve",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/transunion/credit-report/standard/tu-prequal-vantage4/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "transunion",
                        "credit-report",
                        "standard",
                        "tu-prequal-vantage4",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ]
            },
            {
              "name": "tu-prequal-fico9",
              "item": [
                {
                  "name": "[Step 1] JSON Credit Order",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "//console.log(data);",
                          "if(data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"BARBARA\",\n    \"middleName\": \"M\",\n    \"lastName\": \"DOTY\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1966-01-04\",\n    \"ssn\": \"666321120\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"1100 LYNHURST LN\",\n            \"addressLine2\": \"\",\n            \"city\": \"DENTON\",\n            \"state\": \"TX\",\n            \"postalCode\": \"762058006\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/transunion/credit-report/standard/tu-prequal-fico9",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "transunion",
                        "credit-report",
                        "standard",
                        "tu-prequal-fico9"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"BARBARA\",\n    \"middleName\": \"M\",\n    \"lastName\": \"DOTY\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1966-01-04\",\n    \"ssn\": \"666321120\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"1100 LYNHURST LN\",\n            \"addressLine2\": \"\",\n            \"city\": \"DENTON\",\n            \"state\": \"TX\",\n            \"postalCode\": \"762058006\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/transunion/standard-credit-report/pdf/tu-prequal-fico9/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "transunion",
                        "standard-credit-report",
                        "pdf",
                        "tu-prequal-fico9",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 3] JSON Credit Retrieve",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"BARBARA\",\n    \"middleName\": \"M\",\n    \"lastName\": \"DOTY\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1966-01-04\",\n    \"ssn\": \"666321120\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"1100 LYNHURST LN\",\n            \"addressLine2\": \"\",\n            \"city\": \"DENTON\",\n            \"state\": \"TX\",\n            \"postalCode\": \"762058006\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/transunion/credit-report/standard/tu-prequal-fico9/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "transunion",
                        "credit-report",
                        "standard",
                        "tu-prequal-fico9",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ]
            }
          ]
        },
        {
          "name": "Experian",
          "item": [
            {
              "name": "exp-prequal-vantage4",
              "item": [
                {
                  "name": "[Step 1] JSON Credit Order",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if(data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/credit-report/standard/exp-prequal-vantage4",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "credit-report",
                        "standard",
                        "exp-prequal-vantage4"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/standard-credit-report/pdf/exp-prequal-vantage4/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "standard-credit-report",
                        "pdf",
                        "exp-prequal-vantage4",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 3] JSON Credit Retrieve",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/credit-report/standard/exp-prequal-vantage4/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "credit-report",
                        "standard",
                        "exp-prequal-vantage4",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ]
            },
            {
              "name": "exp-prequal-fico9",
              "item": [
                {
                  "name": "[Step 1] JSON Credit Order",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if(data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/credit-profile/credit-report/standard/exp-prequal-fico9",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "credit-profile",
                        "credit-report",
                        "standard",
                        "exp-prequal-fico9"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/credit-profile/standard-credit-report/pdf/exp-prequal-fico9/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "credit-profile",
                        "standard-credit-report",
                        "pdf",
                        "exp-prequal-fico9",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 3] JSON Credit Retrieve",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/credit-profile/credit-report/standard/exp-prequal-fico9/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "credit-profile",
                        "credit-report",
                        "standard",
                        "exp-prequal-fico9",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ]
            }
          ]
        },
        {
          "name": "Equifax",
          "item": [
            {
              "name": "efx-prequal-vantage4",
              "item": [
                {
                  "name": "[Step 1] JSON Credit Order",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if (data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"pdfReportId\", data.pdfReportId);",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/equifax/credit-report/standard/efx-prequal-vantage4",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "equifax",
                        "credit-report",
                        "standard",
                        "efx-prequal-vantage4"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/equifax/standard-credit-report/pdf/efx-prequal-vantage4/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "equifax",
                        "standard-credit-report",
                        "pdf",
                        "efx-prequal-vantage4",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 3] JSON Credit Retrieve",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if (data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"pdfReportId\", data.pdfReportId);",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/equifax/credit-report/standard/efx-prequal-vantage4/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "equifax",
                        "credit-report",
                        "standard",
                        "efx-prequal-vantage4",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ]
            },
            {
              "name": "efx-prequal-fico9",
              "item": [
                {
                  "name": "[Step 1] JSON Credit Order",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if (data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"pdfReportId\", data.pdfReportId);",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/equifax/credit-report/standard/efx-prequal-fico9",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "equifax",
                        "credit-report",
                        "standard",
                        "efx-prequal-fico9"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/equifax/standard-credit-report/pdf/efx-prequal-fico9/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "equifax",
                        "standard-credit-report",
                        "pdf",
                        "efx-prequal-fico9",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 3] JSON Credit Retrieve",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if (data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"pdfReportId\", data.pdfReportId);",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"WILLIE\",\n    \"middleName\": \"L\",\n    \"lastName\": \"BOOZE\",\n    \"suffix\": \"\",\n    \"birthDate\": \"1963-11-12\",\n    \"ssn\": \"666265040\",\n    \"addresses\": [\n        {\n            \"borrowerResidencyType\": \"Current\",\n            \"addressLine1\": \"5815 KNOLL KREST ST\",\n            \"addressLine2\": \"\",\n            \"city\": \"SAN ANTONIO\",\n            \"state\": \"TX\",\n            \"postalCode\": \"782421118\"\n        }\n    ]\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/equifax/credit-report/standard/efx-prequal-fico9/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "equifax",
                        "credit-report",
                        "standard",
                        "efx-prequal-fico9",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ]
            }
          ]
        }
      ],
      "description": "### **Step 1: Order Credit Report**\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com/api/{bureau}/credit-report/standard/{config}`\n\n- Returns a JSON credit report in the **CRS Standard Format**.\n    \n- The `{config}` and `{bureau}` parameters are preconfigured for your sandbox account (examples are included in this Postman Collection).\n    \n- The `{config}` parameter defines which report configuration to use (set up by CRS).\n    \n- The response includes a `RequestID` header — capture this value for the next step.\n    \n\n### **Step 2: Generate PDF Credit Report**\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com/api/{bureau}/standard-credit-report/pdf/{config}/{RequestID}`\n\n- Returns a PDF version of the report from Step 1.\n    \n- Use the same `{config}` and `RequestID` values.\n    \n- Wait about **200 ms** after Step 1 before calling Step 2 to ensure data is available.\n    \n- Request the PDF within **24 hours** to ensure a single inquiry.\n    \n\n### **Step 3: Retrieve an Existing Credit Report**\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com/api/{bureau}/credit-report/standard/{config}/{RequestID}`\n\n- Retrieves an existing JSON report.\n    \n\n#### Field Documentation\n\n- [CRS Standard Format – Quick Start Guide (PDF)](https://crsgroupinc.egnyte.com/dl/L5BXx4P6S2/CRS_Standard_Format_-_Quick_Start_Guide.pdf_)\n    \n- [CRS Standard Format – OpenAPI Specification (YAML)](https://crsgroupinc.egnyte.com/dl/mQCWozdHSv/crs_standard_format_complete.yaml_)\n    \n- [CRS Standard Format – Test Cases (TXT)](https://crsgroupinc.egnyte.com/dl/zpUNy1kG04/CRS_API_Standard_Format_Testcases.txt_)"
    },
    {
      "name": "Identity Verification",
      "item": [
        {
          "name": "TransUnion TruValidate",
          "item": [
            {
              "name": "Identity Manager Verification",
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"number\": \"1\",\n  \"subjectRecords\": [\n    {\n      \"indicative\": {\n        \"names\": [\n          {\n            \"person\": {\n              \"first\": \"ALEXIA\",\n              \"middle\": null,\n              \"last\": \"PORTEGE\"\n            }\n          }\n        ],\n        \"addresses\": [\n          {\n            \"status\": \"CURRENT\",\n            \"street\": {\n              \"unparsed\": \"333 DOGWOOD\"\n            },\n            \"location\": {\n              \"city\": \"RINCON\",\n              \"state\": \"GA\",\n              \"zipCode\": \"31326\"\n            }\n          }\n        ],\n        \"socialSecurities\": [\n          {\n            \"number\": \"666224616\"\n          }\n        ]\n      }\n    }\n  ]\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/transunion/identity-manager-verification",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "transunion",
                    "identity-manager-verification"
                  ]
                },
                "description": "Delivers an accurate and comprehensive view of each consumer by linking proprietary data, personal data, device identifiers and online behaviors. Our advanced insights and global network of fraud reporting helps businesses discover anomalies, assess risk and confidently identify good consumers. This allows you to protect your business and focus on offering effective, personalized and friction-right experiences."
              },
              "response": []
            },
            {
              "name": "Identity Manager Verification (basic)",
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"firstName\": \"Alexia\",\n  \"lastName\": \"Portege\",\n  \"street1\": \"333 DOGWOOD\",\n  \"city\": \"Rincon\",\n  \"state\": \"GA\",\n  \"zip\": \"31326\",\n  \"ssn\": \"666224616\"\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/transunion/identity-manager-verification/basic",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "transunion",
                    "identity-manager-verification",
                    "basic"
                  ]
                },
                "description": "Delivers an accurate and comprehensive view of each consumer by linking proprietary data, personal data, device identifiers and online behaviors. Our advanced insights and global network of fraud reporting helps businesses discover anomalies, assess risk and confidently identify good consumers. This allows you to protect your business and focus on offering effective, personalized and friction-right experiences."
              },
              "response": []
            },
            {
              "name": "Identity Manager Verification PDF",
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/pdf"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"firstName\": \"Alexia\",\n  \"lastName\": \"Portege\",\n  \"street1\": \"333 DOGWOOD\",\n  \"city\": \"Rincon\",\n  \"state\": \"GA\",\n  \"zip\": \"31326\",\n  \"ssn\": \"666224616\"\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/transunion/identity-manager-verification/basic",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "transunion",
                    "identity-manager-verification",
                    "basic"
                  ]
                },
                "description": "Delivers an accurate and comprehensive view of each consumer by linking proprietary data, personal data, device identifiers and online behaviors. Our advanced insights and global network of fraud reporting helps businesses discover anomalies, assess risk and confidently identify good consumers. This allows you to protect your business and focus on offering effective, personalized and friction-right experiences."
              },
              "response": []
            }
          ],
          "description": "### Order JSON TransUnion TruValidate Identity Manager Verification Report\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/transunion/identity-manager-verification`\n\n- This endpoint returns the full TruValidate Identity Manager Verification JSON\n    \n- Use this endpoint when you need comprehensive verification data for the given consumer identity\n    \n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/transunion/identity-manager-verification/basic`\n\n- This endpoint returns only core indicative fields and a verification summary for the given consumer identity\n    \n\n### Order PDF TransUnion TruValidate Identity Manager Verification Report\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/transunion/identity-manager-verification/basic`\n\n- This endpoint returns a PDF version of TruValidate Identity Manager Verification report\n    \n- Must set header: `Accept: application/pdf` to receive a PDF"
        },
        {
          "name": "LexisNexis",
          "item": [
            {
              "name": "Business InstantID",
              "item": [
                {
                  "name": "[Step 1] JSON Business InstantID2",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"searchBy\": {\n        \"company\": {\n            \"companyName\": \"SMB TWENTYCHARAT INC\",\n            \"address\": {\n                \"streetAddress1\": \"157 5TH ST # 90\",\n                \"city\": \"SAN FRANCISCO\",\n                \"state\": \"CA\",\n                \"zip5\": \"94103\"\n            },\n            \"phone\": \"4153962921\",\n            \"fein\": \"473688758\"\n        },\n        \"authorizedRep1\": {\n            \"sequence\": \"true\",\n            \"name\": {\n                \"first\": \"SMBUSDP\",\n                \"last\": \"ONLINESALES\"\n            },\n            \"address\": {\n                \"streetAddress1\": \"157 5TH STP AT876\",\n                \"city\": \"SAN FRANCISCO\",\n                \"state\": \"CA\",\n                \"zip5\": \"94103\"\n            },\n            \"phone\": \"4156648888\",\n            \"ssn\": \"473688757\",\n            \"driverLicenseNumber\": \"A65874587\",\n            \"driverLicenseState\": \"CA\",\n            \"dob\": {\n                \"year\": 1970,\n                \"month\": 6,\n                \"day\": 14\n            }\n        }\n    }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/vfps/biid2",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "vfps",
                        "biid2"
                      ]
                    },
                    "description": "Executes a Business Instant ID2 verification on the provided business and associated subjects"
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF Business InstantID2",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"searchBy\": {\n        \"company\": {\n            \"companyName\": \"SMB TWENTYCHARAT INC\",\n            \"address\": {\n                \"streetAddress1\": \"157 5TH ST # 90\",\n                \"city\": \"SAN FRANCISCO\",\n                \"state\": \"CA\",\n                \"zip5\": \"94103\"\n            },\n            \"phone\": \"4153962921\",\n            \"fein\": \"473688758\"\n        },\n        \"authorizedRep1\": {\n            \"sequence\": \"true\",\n            \"name\": {\n                \"first\": \"SMBUSDP\",\n                \"last\": \"ONLINESALES\"\n            },\n            \"address\": {\n                \"streetAddress1\": \"157 5TH STP AT876\",\n                \"city\": \"SAN FRANCISCO\",\n                \"state\": \"CA\",\n                \"zip5\": \"94103\"\n            },\n            \"phone\": \"4156648888\",\n            \"ssn\": \"473688757\",\n            \"driverLicenseNumber\": \"A65874587\",\n            \"driverLicenseState\": \"CA\",\n            \"dob\": {\n                \"year\": 1970,\n                \"month\": 6,\n                \"day\": 14\n            }\n        }\n    }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/vfps/biid2-pdf",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "vfps",
                        "biid2-pdf"
                      ]
                    },
                    "description": "Executes a Business Instant ID2 verification on the provided business and associated subjects"
                  },
                  "response": []
                }
              ],
              "description": "### **Step 1:** Order LexisNexis VFPS Business Instant ID\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/vfps/biid2`\n\n- This endpoint returns a JSON LexisNexis VFPS Business Instant ID report based on the business and the identity submitted in the request body.\n    \n\n### **Step 2:** Order LexisNexis VFPS Business Instant ID PDF\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/instant-id/pdf/{RequestID}`\n\n- This endpoint returns a PDF LexisNexis VFPS Business Instant ID report based on the business and the identity submitted in the request body.\n    \n- Send this request within 24 hours of receiving the JSON LexisNexis VFPS Business Instant ID report using the same exact request body to ensure this flow results in a single inquiry.\n    \n\n#### Field Documentation\n\n- [LexisNexis VFPS Business Instant ID Data Definitions.pdf](https://crsgroupinc.egnyte.com/dl/d71FvitxYI/CRS_API_LexisNexis_VFPS_-_Business_Instant_ID_-_Data_Definitions.pdf_)\n    \n- [Testcases - LexisNexis VFPS Business Instant ID.txt](https://crsgroupinc.egnyte.com/dl/973H5hrn5k/Testcases_-_LexisNexis_VFPS_Business_Instant_ID.txt_)"
            },
            {
              "name": "Consumer Instant ID",
              "item": [
                {
                  "name": "[Step 1] JSON Instant ID",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if (data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "",
                        "type": "text",
                        "disabled": true
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"NATALIE\",\n    \"lastName\": \"KORZEC\",\n    \"ssn\": \"7537\",\n    \"dateOfBirth\": \"1940-12-23\",\n    \"streetAddress\": \"801 E OGDEN 1011\",\n    \"city\": \"VAUGHN\",\n    \"state\": \"WA\",\n    \"zipCode\": \"98394\",\n    \"homePhone\": \"5031234567\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/instant-id/instant-id",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "instant-id",
                        "instant-id"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF Instant ID",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "//console.log(pm.response.text());",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Accept",
                        "value": "application/pdf",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"NATALIE\",\n    \"lastName\": \"KORZEC\",\n    \"ssn\": \"7537\",\n    \"dateOfBirth\": \"1940-12-23\",\n    \"streetAddress\": \"801 E OGDEN 1011\",\n    \"city\": \"VAUGHN\",\n    \"state\": \"WA\",\n    \"zipCode\": \"98394\",\n    \"homePhone\": \"5031234567\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/instant-id/pdf/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "instant-id",
                        "pdf",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ],
              "description": "#### **Step 1:** Order LexisNexis Consumer Instant ID\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/instant-id/instant-id`\n\n- This endpoint returns a JSON LexisNexis Consumer Instant ID report based on the identity submitted in the request body.\n    \n\n### **Step 2:** Order LexisNexis Consumer Instant ID PDF\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/instant-id/pdf/{RequestID}`\n\n- This endpoint returns a PDF LexisNexis Consumer Instant ID report based on the `RequestID` from step 1.\n    \n- The `RequestID` for a report can be found in the response headers for an order in step 1.\n    \n- Use the `RequestID` in the URL to generate a PDF of the report that is associated with that RequestID\n    \n- Send this request within 24 hours of receiving the JSON LexisNexis Consumer Instant ID report to ensure this flow results in a single inquiry.\n    \n\n#### Documentation:\n\n- [LexisNexis Consumer Instant ID Testcases (TXT)](https://crsgroupinc.egnyte.com/dl/FwmcDH3Pb77T/Testcases_-_LexisNexis_Consumer_Instant_ID.txt_)"
            },
            {
              "name": "Consumer Flex ID",
              "item": [
                {
                  "name": "[Step 1] JSON Consumer Flex ID",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "console.log(data);",
                          "if (data) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "",
                        "type": "text",
                        "disabled": true
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"NATALIE\",\n    \"lastName\": \"KORZEC\",\n    \"ssn\": \"7537\",\n    \"dateOfBirth\": \"1940-12-23\",\n    \"streetAddress\": \"801 E OGDEN 1011\",\n    \"city\": \"VAUGHN\",\n    \"state\": \"WA\",\n    \"zipCode\": \"98394\",\n    \"homePhone\": \"5031234567\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/flex-id/flex-id",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "flex-id",
                        "flex-id"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF Consumer Flex ID",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "console.log(pm.iterationData);",
                          "if (pm.iterationData) {",
                          "    console.log(pm.response.headers.get(\"RequestID\"));",
                          "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                          "}",
                          ""
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Accept",
                        "value": "application/pdf"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"NATALIE\",\n    \"lastName\": \"KORZEC\",\n    \"ssn\": \"7537\",\n    \"dateOfBirth\": \"1940-12-23\",\n    \"streetAddress\": \"801 E OGDEN 1011\",\n    \"city\": \"VAUGHN\",\n    \"state\": \"WA\",\n    \"zipCode\": \"98394\",\n    \"homePhone\": \"5031234567\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/flex-id/pdf/{{RequestID}}",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "flex-id",
                        "pdf",
                        "{{RequestID}}"
                      ]
                    }
                  },
                  "response": []
                }
              ],
              "description": "# Overview:\n\nLexisNexis® FlexID is an identity verification service that surfaces authoritative, data‑driven checks on a consumer’s personally identifiable information (PII). It is designed to help your business approve more applicants on the first attempt, reduce abandonment in digital onboarding flows, and support fraud and compliance controls without adding unnecessary friction.\n\n#### **Step 1:** Order LexisNexis Consumer Flex ID\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/flex-id/flex-id`\n\n- This endpoint returns a JSON LexisNexis Consumer Flex ID report based on the identity submitted in the request body.\n    \n\n#### Documentation:\n\n- [LexisNexis FlexID Documentation](https://crsgroupinc.egnyte.com/dl/69KWb4dj4Vcd)"
            },
            {
              "name": "Comprehensive Person Report (BPS Report)",
              "item": [
                {
                  "name": "[Step 1] JSON BpsReport",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "const header1 = pm.response.headers.get('RequestID');",
                          "if(header1) pm.environment.set(\"requestid\", header1);"
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "no-cache",
                        "type": "text",
                        "disabled": true
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"ARTHUR\",\n    \"middleName\": \"EDWIN\",\n    \"lastName\": \"ROZETTA\",\n    \"ssn\": \"773334568\",\n    \"dateOfBirth\": \"1971-09-03\",\n    \"streetAddress\": \"3915 YULWARE CIR\",\n    \"city\": \"WOLFHILL\",\n    \"state\": \"AK\",\n    \"zipCode\": \"05897\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/bps-report/bps-report",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "bps-report",
                        "bps-report"
                      ]
                    }
                  },
                  "response": []
                },
                {
                  "name": "[Step 2] PDF BpsReport PDF",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "const header1 = pm.response.headers.get('RequestID');",
                          "if(header1) pm.environment.set(\"requestid\", header1);"
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "auth": {
                      "type": "bearer",
                      "bearer": [
                        {
                          "key": "token",
                          "value": "{{utoken}}",
                          "type": "string"
                        }
                      ]
                    },
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/pdf"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "",
                        "type": "text",
                        "disabled": true
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"ARTHUR\",\n    \"middleName\": \"EDWIN\",\n    \"lastName\": \"ROZETTA\",\n    \"ssn\": \"773334568\",\n    \"dateOfBirth\": \"1971-09-03\",\n    \"streetAddress\": \"3915 YULWARE CIR\",\n    \"city\": \"WOLFHILL\",\n    \"state\": \"AK\",\n    \"zipCode\": \"05897\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/bps-report/pdf/bps-report",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "bps-report",
                        "pdf",
                        "bps-report"
                      ]
                    }
                  },
                  "response": []
                }
              ],
              "description": "### **Step 1:** Order LexisNexis BPS Report\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/bps-report/bps-report`\n\n- This endpoint returns a JSON LexisNexis BPS report based on the identity submitted in the request body.\n    \n\n### **Step 2:** Order LexisNexis BPS report PDF\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/bps-report/pdf/bps-report`\n\n- This endpoint returns a PDF LexisNexis BPS Report\n    \n- Must set header: `Accept: application/pdf` to receive a PDF\n    \n- Send this request within 24 hours of receiving the JSON LexisNexis Consumer Instant ID report to ensure this flow results in a single inquiry."
            }
          ]
        },
        {
          "name": "Experian Precise ID",
          "item": [
            {
              "name": "Screening with Scores",
              "item": [
                {
                  "name": "Precise ID Screening + Scores",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "if (data) {",
                          "    if(data.sessionId) pm.collectionVariables.set(\"pid_sessionId\", data.sessionId);",
                          "}"
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "no-cache",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"AILEEN\",\n    \"middleName\": \"M\",\n    \"lastName\": \"SAIDMAN\",\n    \"nameSuffix\": \"\",\n    \"street1\": \"400 W END AVE\",\n    \"street2\": \"14D\",\n    \"city\": \"NEW YORK\",\n    \"state\": \"NY\",\n    \"zip\": \"10024\",\n    \"dob\": \"1931-02-25\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/cc2/exp-screening-scores",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "cc2",
                        "exp-screening-scores"
                      ]
                    }
                  },
                  "response": [
                    {
                      "name": "OK (Accept)",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          },
                          {
                            "key": "Cache-Control",
                            "value": "no-cache",
                            "type": "text"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"firstName\":\"KEITH\",\n    \"lastName\":\"PARRISH\",\n    \"middleName\":\"PAGE\",\n    \"nameSuffix\":\"\",\n    \"dob\":\"1949-07-15\",\n    \"street1\":\"1110 RANDA ST\",\n    \"street2\":\"3\",\n    \"city\":\"COPPERAS COVE\",\n    \"state\":\"TX\",\n    \"zip\":\"76522\",\n    \"pobox\":\"\",\n    \"phone\":\"9192645752\",\n    \"email\":\"test@crscreditapi.com\",\n    \"ssn\":\"666422767\"\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "/experian/cc2/exp-cc2-screening-scores",
                          "path": [
                            "experian",
                            "cc2",
                            "exp-cc2-screening-scores"
                          ]
                        }
                      },
                      "status": "OK",
                      "code": 200,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Fri, 31 Jan 2025 20:52:21 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "2573d9e3-0a7b-4741-b95b-bd4fe5c3a23e"
                        },
                        {
                          "key": "userId",
                          "value": "cbab0743-5d55-438e-822c-a757b71cb7fb"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"initialDecision\": \"ACC\",\n    \"finalDecision\": \"ACC\",\n    \"preciseIDScore\": 767,\n    \"preciseMatchScore\": 541,\n    \"validationScore\": 732,\n    \"verificationScore\": 642,\n    \"fpdScore\": 0,\n    \"sessionId\": \"Y7NZUARQBLI2CQC3E22YT6HO.pidd1v-2501311452202100645794\",\n    \"reasons\": [\n        {\n            \"value\": \"Not Supplied\",\n            \"code\": \"    \"\n        },\n        {\n            \"value\": \"Not Supplied\",\n            \"code\": \"    \"\n        },\n        {\n            \"value\": \"Not Supplied\",\n            \"code\": \"    \"\n        },\n        {\n            \"value\": \"Not Supplied\",\n            \"code\": \"    \"\n        },\n        {\n            \"value\": \"\",\n            \"code\": \"\"\n        }\n    ],\n    \"ofacValue\": \"No match\",\n    \"ofacCount\": 0\n}"
                    },
                    {
                      "name": "OK (Refer)",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          },
                          {
                            "key": "Cache-Control",
                            "value": "no-cache",
                            "type": "text"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"firstName\": \"AILEEN\",\n    \"middleName\": \"M\",\n    \"lastName\": \"SAIDMAN\",\n    \"nameSuffix\": \"\",\n    \"street1\": \"400 W END AVE\",\n    \"street2\": \"14D\",\n    \"city\": \"NEW YORK\",\n    \"state\": \"NY\",\n    \"zip\": \"10024\",\n    \"dob\": \"1931-02-25\"\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "/experian/cc2/exp-cc2-screening-scores",
                          "path": [
                            "experian",
                            "cc2",
                            "exp-cc2-screening-scores"
                          ]
                        }
                      },
                      "status": "OK",
                      "code": 200,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Fri, 31 Jan 2025 20:53:42 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "1fa1fdd5-a877-46e5-bd51-40698e2c99ef"
                        },
                        {
                          "key": "userId",
                          "value": "cbab0743-5d55-438e-822c-a757b71cb7fb"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"initialDecision\": \"R20\",\n    \"finalDecision\": \"R20\",\n    \"preciseIDScore\": 355,\n    \"preciseMatchScore\": 232,\n    \"validationScore\": 348,\n    \"verificationScore\": 460,\n    \"fpdScore\": 0,\n    \"sessionId\": \"WTLVTR5F6VT0C3OCBYBKEGD0.pidf1v-2501311453401090199059\",\n    \"reasons\": [\n        {\n            \"value\": \"Not Supplied\",\n            \"code\": \"    \"\n        },\n        {\n            \"value\": \"Not Supplied\",\n            \"code\": \"    \"\n        },\n        {\n            \"value\": \"Not Supplied\",\n            \"code\": \"    \"\n        },\n        {\n            \"value\": \"Not Supplied\",\n            \"code\": \"    \"\n        },\n        {\n            \"value\": \"\",\n            \"code\": \"\"\n        }\n    ],\n    \"ofacValue\": \"No match\",\n    \"ofacCount\": 0\n}"
                    }
                  ]
                }
              ],
              "description": "## Experian Precise ID Identity Screening with Scores\n\nOrder Precise ID Screening Scores\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com//api/experian/cc2/exp-cc2-screening-scores/`\n\n- This endpoint returns the Precise ID Screening Scores given a consumer identity.\n    \n- The score measures the risk of identity fraud and the accuracy of an applicant's identity.\n    \n- Used for standard screening and identity validation\n    \n\nDocumentation:\n\n- [Experian&nbsp;Precise ID Documentation](https://crsgroupinc.egnyte.com/dl/G9mJVmVMTWWy/CRS_API_Experian_Precise_ID.pdf_) \n    \n- [Precise ID Test Cases](https://crsgroupinc.egnyte.com/dl/KkWgMT6x339K/Testcases_-_Experian_Precise_ID.txt_)"
            },
            {
              "name": "Screening with KIQ",
              "item": [
                {
                  "name": "[Step 1] Precise ID Initial",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "if (data) {",
                          "    if(data.sessionId) pm.collectionVariables.set(\"pid_sessionId\", data.sessionId);",
                          "    if(data.oneTimePasscode) pm.collectionVariables.set(\"pid_OTP\", data.oneTimePasscode);",
                          "}"
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "no-cache",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"AILEEN\",\n    \"middleName\": \"M\",\n    \"lastName\": \"SAIDMAN\",\n    \"nameSuffix\": \"\",\n    \"street1\": \"400 W END AVE\",\n    \"street2\": \"14D\",\n    \"city\": \"NEW YORK\",\n    \"state\": \"NY\",\n    \"zip\": \"10024\",\n    \"dob\": \"1931-02-25\",\n    \"phone\": \"9195555555\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/cc2/exp-screening-kiq",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "cc2",
                        "exp-screening-kiq"
                      ]
                    }
                  },
                  "response": [
                    {
                      "name": "OK",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          },
                          {
                            "key": "Cache-Control",
                            "value": "no-cache",
                            "type": "text"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"firstName\":\"KEITH\",\n    \"lastName\":\"PARRISH\",\n    \"middleName\":\"PAGE\",\n    \"nameSuffix\":\"\",\n    \"dob\":\"1949-07-15\",\n    \"street1\":\"1110 RANDA ST\",\n    \"street2\":\"4\",\n    \"city\":\"COPPERAS COVE\",\n    \"state\":\"TX\",\n    \"zip\":\"76522\",\n    \"pobox\":\"\",\n    \"email\":\"test@crscreditapi.com\",\n    \"ssn\":\"666422767\"\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{CRS_API_SANDBOX_BASE_URL}}/experian/cc2/exp-cc2-ao-scores-otp-kiq",
                          "host": [
                            "{{CRS_API_SANDBOX_BASE_URL}}"
                          ],
                          "path": [
                            "experian",
                            "cc2",
                            "exp-cc2-ao-scores-otp-kiq"
                          ]
                        }
                      },
                      "status": "OK",
                      "code": 200,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Fri, 31 Jan 2025 20:49:33 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "9647b955-8dc4-4bbe-8e71-cb06755b41c8"
                        },
                        {
                          "key": "userId",
                          "value": "cbab0743-5d55-438e-822c-a757b71cb7fb"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"initialDecision\": \"R10\",\n    \"finalDecision\": \"R10\",\n    \"preciseIDScore\": 746,\n    \"preciseMatchScore\": 679,\n    \"validationScore\": 698,\n    \"verificationScore\": 716,\n    \"fpdScore\": 752,\n    \"sessionId\": \"0QHJXE2ZUUB3UHNXWJFWTH5Z.pidd4v-2501311449311529680273\",\n    \"reasons\": [\n        {\n            \"value\": \"High credit limits and balances on revolving trades\",\n            \"code\": \"B105\"\n        },\n        {\n            \"value\": \"High average credit limit or loan amount on revolving/real property trades or credit balance to limit ratio on revolving trades\",\n            \"code\": \"B109\"\n        },\n        {\n            \"value\": \"Lack of public record information or collection trades indicative that file is susceptible to ID fraud\",\n            \"code\": \"B110\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        }\n    ],\n    \"ofacValue\": \"No match\",\n    \"ofacCount\": 0,\n    \"questions\": [\n        {\n            \"question\": \"Which of the following businesses have you been associated with? If there is not a matched business name, please select 'NONE OF THE ABOVE'.\",\n            \"choices\": [\n                \"HEUBLEIN\",\n                \"ALL CARE AGENCY\",\n                \"ALONZO INSPECTIONS\",\n                \"AL POWER CO\",\n                \"NONE OF THE ABOVE/DOES NOT APPLY\"\n            ]\n        },\n        {\n            \"question\": \"Which of the following is a license plate number that is associated with an automobile registered in your name? If there is not a matched license plate, please select 'NONE OF THE ABOVE'.\",\n            \"choices\": [\n                \"D39DYF\",\n                \"18CDFE1234\",\n                \"VINGE\",\n                \"V40TTY\",\n                \"NONE OF THE ABOVE/DOES NOT APPLY\"\n            ]\n        },\n        {\n            \"question\": \"According to our records, you currently own/lease, or have owned/leased within the past year, one of the following vehicles. Please select the vehicle that you purchased or leased prior to March 2013  from the following choices.\",\n            \"choices\": [\n                \"CHEVROLET TAHOE\",\n                \"NISSAN PATHFINDER\",\n                \"CHRYSLER PACIFICA\",\n                \"MITSUBISHI ENDEAVOR\",\n                \"NONE OF THE ABOVE/DOES NOT APPLY\"\n            ]\n        },\n        {\n            \"question\": \"Which of the following people have lived with you in the last 10 years? If there is not a matched name, please select 'NONE OF THE ABOVE'.\",\n            \"choices\": [\n                \"NICOLETTE KARAKOZOFF\",\n                \"ANDY HWANG\",\n                \"CATHY JENKINS\",\n                \"ANDRE GLOTFELTY\",\n                \"NONE OF THE ABOVE/DOES NOT APPLY\"\n            ]\n        }\n    ]\n}"
                    }
                  ]
                },
                {
                  "name": "[Step 2] Precise ID KIQ Verification",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "no-cache",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"sessionId\": \"{{pid_sessionId}}\",\n    \"answers\": {\n        \"outWalletAnswer1\": \"4\",\n        \"outWalletAnswer2\": \"4\",\n        \"outWalletAnswer3\": \"4\",\n        \"outWalletAnswer4\": \"4\",\n        \"outWalletAnswer5\": \"4\"\n    }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/cc2/exp-screening-kiq/kiq",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "cc2",
                        "exp-screening-kiq",
                        "kiq"
                      ]
                    }
                  },
                  "response": [
                    {
                      "name": "Session Timeout",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          },
                          {
                            "key": "Cache-Control",
                            "value": "no-cache",
                            "type": "text"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"sessionId\": \"{{pid_sessionId}}\",\n    \"answers\": {\n        \"outWalletAnswer1\": \"3\",\n        \"outWalletAnswer2\": \"3\",\n        \"outWalletAnswer3\": \"3\",\n        \"outWalletAnswer4\": \"3\",\n        \"outWalletAnswer5\": \"3\"\n    }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{CRS_API_SANDBOX_BASE_URL}}/experian/cc2/exp-cc2-ao-scores-otp-kiq/kiq",
                          "host": [
                            "{{CRS_API_SANDBOX_BASE_URL}}"
                          ],
                          "path": [
                            "experian",
                            "cc2",
                            "exp-cc2-ao-scores-otp-kiq",
                            "kiq"
                          ]
                        }
                      },
                      "status": "Bad Request",
                      "code": 400,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Fri, 31 Jan 2025 20:50:59 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "4bc5c20d-fbe9-42cd-8a28-a1073448ae38"
                        },
                        {
                          "key": "userId",
                          "value": "cbab0743-5d55-438e-822c-a757b71cb7fb"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"timestamp\": \"2025-01-31T20:50:59.691+00:00\",\n    \"codes\": [\n        \"CRS502\"\n    ],\n    \"messages\": [\n        \"Precise ID Error:710\"\n    ],\n    \"details\": [\n        \"Session timeout\"\n    ]\n}"
                    }
                  ]
                }
              ],
              "description": "## Experian Precise ID Identity Screening with KIQ\n\nGet additional identiy confidence beyond scores alone.\n\n**\\[Step 1\\] POST**\n\n`https://api-sandbox.stitchcredit.com/api/experian/cc2/exp-screening-kiq`\n\n- Given a consumer's identiy details\n    \n- returns a verification decision recommendation (ACCEPT, REFER, or Rxx)\n    \n- returns knowledgeIQ multiple-choice questions.\n    \n\n**\\[Step 2\\] POST**\n\n`https://api-sandbox.stitchcredit.com/experian/cc2/exp-ao-scores-otp-kiq/kiq`\n\n- Given the answers to the KIQ multiple-choice questions\n    \n- returns updated verification decision recommendation (ACCEPT, REFER, or Rxx)\n    \n\nDocumentation:\n\n- [Experian&nbsp;Precise ID Documentation](https://crsgroupinc.egnyte.com/dl/G9mJVmVMTWWy/CRS_API_Experian_Precise_ID.pdf_) \n    \n- [Precise ID Test Cases](https://crsgroupinc.egnyte.com/dl/KkWgMT6x339K/Testcases_-_Experian_Precise_ID.txt_)"
            },
            {
              "name": "Account Opening with Scores, OTP, and KIQ",
              "item": [
                {
                  "name": "[Step 1] Precise ID Initial",
                  "event": [
                    {
                      "listen": "test",
                      "script": {
                        "exec": [
                          "var data = pm.response.json();",
                          "if (data) {",
                          "    if(data.sessionId) pm.collectionVariables.set(\"pid_sessionId\", data.sessionId);",
                          "    if(data.oneTimePasscode) pm.collectionVariables.set(\"pid_OTP\", data.oneTimePasscode);",
                          "}"
                        ],
                        "type": "text/javascript",
                        "packages": {},
                        "requests": {}
                      }
                    }
                  ],
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "no-cache",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"firstName\": \"AILEEN\",\n    \"middleName\": \"M\",\n    \"lastName\": \"SAIDMAN\",\n    \"nameSuffix\": \"\",\n    \"street1\": \"400 W END AVE\",\n    \"street2\": \"14D\",\n    \"city\": \"NEW YORK\",\n    \"state\": \"NY\",\n    \"zip\": \"10024\",\n    \"dob\": \"1931-02-25\",\n    \"phone\": \"9195555555\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/cc2/exp-ao-scores-otp-kiq",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "cc2",
                        "exp-ao-scores-otp-kiq"
                      ]
                    }
                  },
                  "response": [
                    {
                      "name": "OK",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          },
                          {
                            "key": "Cache-Control",
                            "value": "no-cache",
                            "type": "text"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"firstName\":\"KEITH\",\n    \"lastName\":\"PARRISH\",\n    \"middleName\":\"PAGE\",\n    \"nameSuffix\":\"\",\n    \"dob\":\"1949-07-15\",\n    \"street1\":\"1110 RANDA ST\",\n    \"street2\":\"4\",\n    \"city\":\"COPPERAS COVE\",\n    \"state\":\"TX\",\n    \"zip\":\"76522\",\n    \"pobox\":\"\",\n    \"email\":\"test@crscreditapi.com\",\n    \"ssn\":\"666422767\"\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "{{CRS_API_SANDBOX_BASE_URL}}/experian/cc2/exp-ao-scores-otp-kiq",
                          "host": [
                            "{{CRS_API_SANDBOX_BASE_URL}}"
                          ],
                          "path": [
                            "experian",
                            "cc2",
                            "exp-ao-scores-otp-kiq"
                          ]
                        }
                      },
                      "status": "OK",
                      "code": 200,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Fri, 31 Jan 2025 20:49:33 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "9647b955-8dc4-4bbe-8e71-cb06755b41c8"
                        },
                        {
                          "key": "userId",
                          "value": "cbab0743-5d55-438e-822c-a757b71cb7fb"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"initialDecision\": \"R10\",\n    \"finalDecision\": \"R10\",\n    \"preciseIDScore\": 746,\n    \"preciseMatchScore\": 679,\n    \"validationScore\": 698,\n    \"verificationScore\": 716,\n    \"fpdScore\": 752,\n    \"sessionId\": \"0QHJXE2ZUUB3UHNXWJFWTH5Z.pidd4v-2501311449311529680273\",\n    \"reasons\": [\n        {\n            \"value\": \"High credit limits and balances on revolving trades\",\n            \"code\": \"B105\"\n        },\n        {\n            \"value\": \"High average credit limit or loan amount on revolving/real property trades or credit balance to limit ratio on revolving trades\",\n            \"code\": \"B109\"\n        },\n        {\n            \"value\": \"Lack of public record information or collection trades indicative that file is susceptible to ID fraud\",\n            \"code\": \"B110\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        }\n    ],\n    \"ofacValue\": \"No match\",\n    \"ofacCount\": 0,\n    \"questions\": [\n        {\n            \"question\": \"Which of the following businesses have you been associated with? If there is not a matched business name, please select 'NONE OF THE ABOVE'.\",\n            \"choices\": [\n                \"HEUBLEIN\",\n                \"ALL CARE AGENCY\",\n                \"ALONZO INSPECTIONS\",\n                \"AL POWER CO\",\n                \"NONE OF THE ABOVE/DOES NOT APPLY\"\n            ]\n        },\n        {\n            \"question\": \"Which of the following is a license plate number that is associated with an automobile registered in your name? If there is not a matched license plate, please select 'NONE OF THE ABOVE'.\",\n            \"choices\": [\n                \"D39DYF\",\n                \"18CDFE1234\",\n                \"VINGE\",\n                \"V40TTY\",\n                \"NONE OF THE ABOVE/DOES NOT APPLY\"\n            ]\n        },\n        {\n            \"question\": \"According to our records, you currently own/lease, or have owned/leased within the past year, one of the following vehicles. Please select the vehicle that you purchased or leased prior to March 2013  from the following choices.\",\n            \"choices\": [\n                \"CHEVROLET TAHOE\",\n                \"NISSAN PATHFINDER\",\n                \"CHRYSLER PACIFICA\",\n                \"MITSUBISHI ENDEAVOR\",\n                \"NONE OF THE ABOVE/DOES NOT APPLY\"\n            ]\n        },\n        {\n            \"question\": \"Which of the following people have lived with you in the last 10 years? If there is not a matched name, please select 'NONE OF THE ABOVE'.\",\n            \"choices\": [\n                \"NICOLETTE KARAKOZOFF\",\n                \"ANDY HWANG\",\n                \"CATHY JENKINS\",\n                \"ANDRE GLOTFELTY\",\n                \"NONE OF THE ABOVE/DOES NOT APPLY\"\n            ]\n        }\n    ]\n}"
                    }
                  ]
                },
                {
                  "name": "[Step 2] Precise ID OTP Verification",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"sessionId\": \"{{pid_sessionId}}\",\n    \"code\": \"{{pid_OTP}}\"\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/cc2/exp-ao-scores-otp-kiq/otp",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "cc2",
                        "exp-ao-scores-otp-kiq",
                        "otp"
                      ]
                    }
                  },
                  "response": [
                    {
                      "name": "OK (Accept)",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"code\": \"{{pid_OTP}}\",\n    \"sessionId\": \"{{pid_sessionId}}\"\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "/experian/cc2/exp-ao-scores-otp-kiq/otp",
                          "path": [
                            "experian",
                            "cc2",
                            "exp-ao-scores-otp-kiq",
                            "otp"
                          ]
                        }
                      },
                      "status": "OK",
                      "code": 200,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Wed, 10 May 2023 15:55:20 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "fbbc209a-b2ee-44a5-9d64-ee686aa4987e"
                        },
                        {
                          "key": "userId",
                          "value": "aeb5a259-156d-43a0-9604-2d3872b1103c"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"initialDecision\": \"R10\",\n    \"finalDecision\": \"ACC\",\n    \"preciseIDScore\": 828,\n    \"preciseMatchScore\": 541,\n    \"validationScore\": 776,\n    \"verificationScore\": 796,\n    \"fpdScore\": 806,\n    \"kbaScore\": 0,\n    \"sessionId\": \"TNPNWYGQLSFKYKLS8RRCD3U8.pidd1v-23051010542097650721\",\n    \"oneTimePasscode\": \"267824\",\n    \"oneTimePasscodeSent\": true,\n    \"oneTimePasscodeMatch\": true,\n    \"reasons\": [\n        {\n            \"value\": \"High credit limits and balances on revolving trades\",\n            \"code\": \"B105\"\n        },\n        {\n            \"value\": \"High average credit limit or loan amount on revolving/real property trades or credit balance to limit ratio on revolving trades\",\n            \"code\": \"B109\"\n        },\n        {\n            \"value\": \"Lack of public record information or collection trades indicative that file is susceptible to ID fraud\",\n            \"code\": \"B110\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        }\n    ],\n    \"ofacValue\": \"No match\",\n    \"ofacCount\": 0\n}"
                    },
                    {
                      "name": "Session Timeout",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"code\": \"{{pid_OTP}}\",\n    \"sessionId\": \"{{pid_sessionId}}\"\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "/experian/cc2/exp-ao-scores-otp-kiq/otp",
                          "path": [
                            "experian",
                            "cc2",
                            "exp-ao-scores-otp-kiq",
                            "otp"
                          ]
                        }
                      },
                      "status": "Bad Request",
                      "code": 400,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Fri, 31 Jan 2025 20:40:05 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "b8753994-ee8f-4076-8ea2-ab201adb4fb7"
                        },
                        {
                          "key": "userId",
                          "value": "cbab0743-5d55-438e-822c-a757b71cb7fb"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"timestamp\": \"2025-01-31T20:40:05.289+00:00\",\n    \"codes\": [\n        \"CRS502\"\n    ],\n    \"messages\": [\n        \"Precise ID Error:710\"\n    ],\n    \"details\": [\n        \"Session timeout\"\n    ]\n}"
                    }
                  ]
                },
                {
                  "name": "[Step 2] Precise ID KIQ Verification",
                  "request": {
                    "method": "POST",
                    "header": [
                      {
                        "key": "Content-Type",
                        "value": "application/json"
                      },
                      {
                        "key": "Accept",
                        "value": "application/json"
                      },
                      {
                        "key": "Cache-Control",
                        "value": "no-cache",
                        "type": "text"
                      }
                    ],
                    "body": {
                      "mode": "raw",
                      "raw": "{\n    \"sessionId\": \"{{pid_sessionId}}\",\n    \"answers\": {\n        \"outWalletAnswer1\": \"3\",\n        \"outWalletAnswer2\": \"3\",\n        \"outWalletAnswer3\": \"3\",\n        \"outWalletAnswer4\": \"3\",\n        \"outWalletAnswer5\": \"3\"\n    }\n}",
                      "options": {
                        "raw": {
                          "language": "json"
                        }
                      }
                    },
                    "url": {
                      "raw": "{{baseUrl}}/experian/cc2/exp-ao-scores-otp-kiq/kiq",
                      "host": [
                        "{{baseUrl}}"
                      ],
                      "path": [
                        "experian",
                        "cc2",
                        "exp-ao-scores-otp-kiq",
                        "kiq"
                      ]
                    }
                  },
                  "response": [
                    {
                      "name": "OK (Accept)",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"sessionId\": \"{{pid_sessionId}}\",\n    \"answers\": {\n        \"outWalletAnswer1\": \"5\",\n        \"outWalletAnswer2\": \"5\",\n        \"outWalletAnswer3\": \"5\",\n        \"outWalletAnswer4\": \"5\",\n        \"outWalletAnswer5\": \"5\"\n    }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "/experian/cc2/exp-ao-scores-otp-kiq/kiq",
                          "path": [
                            "experian",
                            "cc2",
                            "exp-ao-scores-otp-kiq",
                            "kiq"
                          ]
                        }
                      },
                      "status": "OK",
                      "code": 200,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Wed, 10 May 2023 15:57:19 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "065a1331-8651-4411-9469-85f1aa7bb234"
                        },
                        {
                          "key": "userId",
                          "value": "aeb5a259-156d-43a0-9604-2d3872b1103c"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"initialDecision\": \"R10\",\n    \"finalDecision\": \"ACC\",\n    \"preciseIDScore\": 746,\n    \"preciseMatchScore\": 679,\n    \"validationScore\": 698,\n    \"verificationScore\": 716,\n    \"fpdScore\": 752,\n    \"kbaScore\": 49,\n    \"sessionId\": \"I5ATNMIL32NL5V2HOYJVNEBV.pidf1v-23051010564667368003\",\n    \"reasons\": [\n        {\n            \"value\": \"High credit limits and balances on revolving trades\",\n            \"code\": \"B105\"\n        },\n        {\n            \"value\": \"High average credit limit or loan amount on revolving/real property trades or credit balance to limit ratio on revolving trades\",\n            \"code\": \"B109\"\n        },\n        {\n            \"value\": \"Lack of public record information or collection trades indicative that file is susceptible to ID fraud\",\n            \"code\": \"B110\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        }\n    ],\n    \"ofacValue\": \"No match\",\n    \"ofacCount\": 0\n}"
                    },
                    {
                      "name": "OK (Refer)",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          },
                          {
                            "key": "Cache-Control",
                            "value": "no-cache",
                            "type": "text"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"sessionId\": \"{{pid_sessionId}}\",\n    \"answers\": {\n        \"outWalletAnswer1\": \"3\",\n        \"outWalletAnswer2\": \"3\",\n        \"outWalletAnswer3\": \"3\",\n        \"outWalletAnswer4\": \"3\",\n        \"outWalletAnswer5\": \"3\"\n    }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "/experian/cc2/exp-ao-scores-otp-kiq/kiq",
                          "path": [
                            "experian",
                            "cc2",
                            "exp-ao-scores-otp-kiq",
                            "kiq"
                          ]
                        }
                      },
                      "status": "OK",
                      "code": 200,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Fri, 31 Jan 2025 20:39:48 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "538884fd-85a2-4f03-a9ad-254aad1f36fa"
                        },
                        {
                          "key": "userId",
                          "value": "cbab0743-5d55-438e-822c-a757b71cb7fb"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"initialDecision\": \"R10\",\n    \"finalDecision\": \"REF\",\n    \"preciseIDScore\": 746,\n    \"preciseMatchScore\": 679,\n    \"validationScore\": 698,\n    \"verificationScore\": 716,\n    \"fpdScore\": 752,\n    \"kbaScore\": 0,\n    \"sessionId\": \"U3H9A5VTPXBLMBLW2FEDIAQO.pidd3v-2501311439321529671441\",\n    \"reasons\": [\n        {\n            \"value\": \"High credit limits and balances on revolving trades\",\n            \"code\": \"B105\"\n        },\n        {\n            \"value\": \"High average credit limit or loan amount on revolving/real property trades or credit balance to limit ratio on revolving trades\",\n            \"code\": \"B109\"\n        },\n        {\n            \"value\": \"Lack of public record information or collection trades indicative that file is susceptible to ID fraud\",\n            \"code\": \"B110\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        },\n        {\n            \"value\": \"No adverse factor observed\",\n            \"code\": \"B405\"\n        }\n    ],\n    \"ofacValue\": \"No match\",\n    \"ofacCount\": 0\n}"
                    },
                    {
                      "name": "Session Timeout",
                      "originalRequest": {
                        "method": "POST",
                        "header": [
                          {
                            "key": "Content-Type",
                            "value": "application/json"
                          },
                          {
                            "key": "Accept",
                            "value": "application/json"
                          },
                          {
                            "key": "Cache-Control",
                            "value": "no-cache",
                            "type": "text"
                          }
                        ],
                        "body": {
                          "mode": "raw",
                          "raw": "{\n    \"sessionId\": \"{{pid_sessionId}}\",\n    \"answers\": {\n        \"outWalletAnswer1\": \"3\",\n        \"outWalletAnswer2\": \"3\",\n        \"outWalletAnswer3\": \"3\",\n        \"outWalletAnswer4\": \"3\",\n        \"outWalletAnswer5\": \"3\"\n    }\n}",
                          "options": {
                            "raw": {
                              "language": "json"
                            }
                          }
                        },
                        "url": {
                          "raw": "/experian/cc2/exp-ao-scores-otp-kiq/kiq",
                          "path": [
                            "experian",
                            "cc2",
                            "exp-ao-scores-otp-kiq",
                            "kiq"
                          ]
                        }
                      },
                      "status": "Bad Request",
                      "code": 400,
                      "_postman_previewlanguage": "json",
                      "header": [
                        {
                          "key": "Date",
                          "value": "Fri, 31 Jan 2025 20:50:59 GMT"
                        },
                        {
                          "key": "Content-Type",
                          "value": "application/json"
                        },
                        {
                          "key": "Transfer-Encoding",
                          "value": "chunked"
                        },
                        {
                          "key": "Connection",
                          "value": "keep-alive"
                        },
                        {
                          "key": "Vary",
                          "value": "Origin"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Method"
                        },
                        {
                          "key": "Vary",
                          "value": "Access-Control-Request-Headers"
                        },
                        {
                          "key": "RequestID",
                          "value": "4bc5c20d-fbe9-42cd-8a28-a1073448ae38"
                        },
                        {
                          "key": "userId",
                          "value": "cbab0743-5d55-438e-822c-a757b71cb7fb"
                        },
                        {
                          "key": "Cache-Control",
                          "value": "no-cache, no-store, max-age=0, must-revalidate"
                        },
                        {
                          "key": "Pragma",
                          "value": "no-cache"
                        },
                        {
                          "key": "Expires",
                          "value": "0"
                        }
                      ],
                      "cookie": [],
                      "body": "{\n    \"timestamp\": \"2025-01-31T20:50:59.691+00:00\",\n    \"codes\": [\n        \"CRS502\"\n    ],\n    \"messages\": [\n        \"Precise ID Error:710\"\n    ],\n    \"details\": [\n        \"Session timeout\"\n    ]\n}"
                    }
                  ]
                }
              ],
              "description": "**Experian Precise ID for Account Opening** is tailored for financial institutions, card issuers, and lenders who require both **identity verification** and **authentication**.  \nIt combines credit and non-credit data with KnowledgeIQ and OTP to deliver the most comprehensive verification experience.\n\n## Purpose:\n\nDesigned for regulated environments (e.g., KYC, AML) requiring multi-factor verification.  \nThis configuration integrates scoring, challenge-response questions, and mobile passcode authentication into a single decisioning flow.\n\n**\\[Step 1\\] POST**\n\n`https://api-sandbox.stitchcredit.com/api/experian/cc2/exp-ao-scores-otp-kiq`\n\n- Given a consumer's identiy details\n    \n- returns a verification decision recommendation (ACCEPT, REFER, or Rxx)\n    \n- returns Identity scores (preciseIDScore, validationScore, etc.)\n    \n- returns knowledgeIQ multiple-choice questions (if applicable)\n    \n- returns a One-time passcode (OTP) sent via SMS (if eligible)\n    \n\n**\\[Step 2\\] POST**\n\n`https://api-sandbox.stitchcredit.com/experian/cc2/exp-ao-scores-otp-kiq/otp`\n\n- Given the OTP value\n    \n- returns updated verification decision recommendation (ACCEPT, REFER, or Rxx)\n    \n- OTP behavior & uses:\n    \n    - Triggered only when a valid phone number match occurs.\n        \n    - If a phone match is confirmed, OTP takes precedence over KIQ.\n        \n    - OTP failures do not waterfall to KIQ.\n        \n\n**\\[Step 2\\] POST**\n\n`https://api-sandbox.stitchcredit.com/experian/cc2/exp-ao-scores-otp-kiq/kiq`\n\n- Given the answers to the KIQ multiple-choice questions\n    \n- returns updated verification decision recommendation (ACCEPT, REFER, or Rxx)\n    \n- KIQ behavior & uses:\n    \n    - Used when no valid phone match exists, and sufficient data is available for question generation.\n        \n    - Not used if data is insufficient or if OTP has already been triggered.\n        \n    - Account Opening is the only configuration that supports both KIQ and OTP.\n        \n    - OTP is prioritized when available; KIQ is the fallback when a valid phone number match cannot be made.\n        \n\nDocumentation:\n\n- [Experian&nbsp;Precise ID Documentation](https://crsgroupinc.egnyte.com/dl/G9mJVmVMTWWy/CRS_API_Experian_Precise_ID.pdf_) \n    \n- [Precise ID Test Cases](https://crsgroupinc.egnyte.com/dl/KkWgMT6x339K/Testcases_-_Experian_Precise_ID.txt_)"
            }
          ]
        },
        {
          "name": "Fraud Finder",
          "item": [
            {
              "name": "[Step 1] JSON Fraud Finder",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "var data = pm.response.json();",
                      "console.log(data);",
                      "if (data) {",
                      "    console.log(pm.response.headers.get(\"RequestID\"));",
                      "    pm.collectionVariables.set(\"RequestID\", pm.response.headers.get(\"RequestID\"));",
                      "}",
                      ""
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                },
                {
                  "listen": "prerequest",
                  "script": {
                    "exec": [
                      ""
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                }
              ],
              "request": {
                "auth": {
                  "type": "bearer",
                  "bearer": [
                    {
                      "key": "token",
                      "value": "{{utoken}}",
                      "type": "string"
                    }
                  ]
                },
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  },
                  {
                    "key": "Accept",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n    \"firstName\": \"John\",\n    \"lastName\": \"Doe\",\n    \"phoneNumber\": \"1234929999\",\n    \"email\": \"example@atdata.com\",\n    \"ipAddress\": \"47.25.65.96\",\n    \"address\": {\n        \"addressLine1\": \"15900  SPACE CN\",\n        \"city\": \"HOUSTON\",\n        \"state\": \"TX\",\n        \"postalCode\": \"77062\"\n    }\n}",
                  "options": {
                    "raw": {
                      "language": "json"
                    }
                  }
                },
                "url": {
                  "raw": "{{baseUrl}}/fraud-finder/fraud-finder",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "fraud-finder",
                    "fraud-finder"
                  ]
                }
              },
              "response": []
            },
            {
              "name": "[Step 2] PDF Fraud Finder",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "//console.log(pm.response.text());",
                      ""
                    ],
                    "type": "text/javascript",
                    "packages": {},
                    "requests": {}
                  }
                }
              ],
              "request": {
                "auth": {
                  "type": "bearer",
                  "bearer": [
                    {
                      "key": "token",
                      "value": "{{utoken}}",
                      "type": "string"
                    }
                  ]
                },
                "method": "POST",
                "header": [
                  {
                    "key": "Accept",
                    "value": "application/pdf",
                    "type": "text"
                  }
                ],
                "url": {
                  "raw": "{{baseUrl}}/fraud-finder/pdf/{{RequestID}}",
                  "host": [
                    "{{baseUrl}}"
                  ],
                  "path": [
                    "fraud-finder",
                    "pdf",
                    "{{RequestID}}"
                  ]
                }
              },
              "response": []
            }
          ],
          "description": "### **Step 1:** Order Fraud Finder Report\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/fraud-finder/fraud-finder`\n\n- This endpoint returns a JSON Fraud Finder report for the identity submitted in the request body.\n    \n\n### **Step 2:** Order Fraud Finder PDF Report\n\n**POST**\n\n`https://api-sandbox.stitchcredit.com:443/api/fraud-finder/pdf/{RequestID}`\n\n- This endpoint returns a PDF Fraud Finder report for the order in step 1\n    \n- The `RequestID` for a report can be found in the response headers for a order in step 1\n    \n- Use the `RequestID` in the URL to generate a PDF of the report that is associated with that `RequestID`\n    \n- Send this request within 24 hours of receiving the JSON Fraud Finder report to ensure this flow results in a single inquiry\n    \n\n#### Documentation:\n\n- [CRS Fraud Finder Overview.pdf](https://crsgroupinc.egnyte.com/dl/HgcJxxrTCJYk)\n    \n- [CRS_Fraud_Finder_OpenAPI_Spec.yml](https://crsgroupinc.egnyte.com/dl/qfWDcQrXbRGg)"
        }
      ]
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{utoken}}",
        "type": "string"
      }
    ]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "requests": {},
        "exec": [
          ""
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "requests": {},
        "exec": [
          ""
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "client_id",
      "value": "david_demo@convergentai.tech"
    },
    {
      "key": "client_secret",
      "value": "sob91N5bokg7DT2ysRpwCCIQ"
    },
    {
      "key": "baseURL",
      "value": "https://api-sandbox.stitchcredit.com:443/api"
    },
    {
      "key": "utoken",
      "value": ""
    },
    {
      "key": "uRefreshToken",
      "value": ""
    },
    {
      "key": "RequestID",
      "value": ""
    },
    {
      "key": "pdfReportId",
      "value": ""
    },
    {
      "key": "baseUrl",
      "value": "https://api-sandbox.stitchcredit.com:443/api"
    },
    {
      "key": "pid_sessionId",
      "value": ""
    },
    {
      "key": "password",
      "value": ""
    },
    {
      "key": "username",
      "value": ""
    },
    {
      "key": "cic_criminal_responseID",
      "value": ""
    },
    {
      "key": "cic_eviction_responseID",
      "value": ""
    },
    {
      "key": "liensAndJudgementsUniqueId",
      "value": ""
    }
  ]
}