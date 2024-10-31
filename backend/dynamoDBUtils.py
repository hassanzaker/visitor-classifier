from urllib.parse import urlparse

import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name='us-east-2')

# Reference to the users table
visitors = dynamodb.Table('visitors')


def get_site_name(url):
    # Parse the URL to extract components
    parsed_url = urlparse(url)
    hostname = parsed_url.hostname  # Extract the hostname, e.g., "www.sitename.com"

    # Remove "www." if it exists
    if hostname and hostname.startswith("www."):
        hostname = hostname[4:]  # Remove the first 4 characters ("www.")

    return hostname


def add_url(user_id, url, questions, summary):
    try:
        # See if the user exists
        response = visitors.get_item(
            Key={'userId': user_id}
        )
        item = None
        if 'Item' in response:  # user exists in database
            item = response['Item']
            flag = True
            for site in item['sites']:
                if url == site['address']:
                    site['questions'] = questions
                    flag = False
                    break
            if flag:
                    item['sites'].append({"address": url, "questions": questions, "summary": summary})


            visitors.put_item(Item=item)
        else: # add new user
            visitors.put_item(
                Item={
                    'userId': str(user_id),
                    'sites': [{"address": url, "questions": questions, "summary": summary}]
                }
            )

        response = visitors.get_item(
            Key={'userId': str(user_id)}
        )
        if "Item" in response:
            print(response['Item'])

        return response

    except ClientError as e:
        print(e.response['Error']['Message'])


def get_visitor(user_id):
    try:
        response = visitors.get_item(
            Key={
                'userId': user_id
            }
        )
        return response.get('Item')
    except ClientError as e:
        return False

def add_categories(user_id, url, questions, categories):
    try:
        response = visitors.get_item(
            Key={
                'userId': user_id
            }
        )

        if "Item" in response:
            item = response['Item']
            flag = True
            for site in item['sites']:
                if url == site['address']:
                    site['categories'] = categories
                    site['questions'] = questions
                    flag = False
                    break
            if flag:
                print("url doesn't exist!")

            visitors.put_item(Item=item)

        return response.get('Item')
    except ClientError as e:
        print(e.response['Error']['Message'])
