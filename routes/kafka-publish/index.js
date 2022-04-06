const registryUrl = 'http://localhost:8081'
const kakfaBroker = 'localhost:9092'


///////////////////////// TEST DATA /////////////////////////
// {
//     "topicName": "<your-topic-name>",
//     "key": "testkey",
//     "value": { "hello" : "world" }
// }

const avro = require('avsc')
const registry = require('avro-schema-registry')(registryUrl);
const kafka = require('kafka-node')
const request = require('request')
const client = new kafka.KafkaClient({
  kafkaHost: kakfaBroker
})

const fs = require('fs')
const path = require("path");

async function POST(req, res){
    const produceOptions = {
        requireAcks: 1,
        ackTimeoutMs: 100,
        partitionerType: 3
    }
    const producer = new kafka.Producer(client, produceOptions)
    producer.on('error', err => {
        console.warn('Producer error', err)
    })

    const { key, value, topicName } = req.body;

    const schemas = await getSchemas(topicName)

    const encodedKey = await registry.encodeKey(topicName, schemas.key, key)
    const encodedValue = await registry.encodeMessage(topicName, schemas.value, value)

    const payloads = [{
        topic: topicName,
        messages: [new kafka.KeyedMessage(encodedKey, encodedValue)]
    }]
    
    producer.send(payloads, function (err, data) {
        res.status(200).send(err || data);
        if (!err)
            producer.close()
    })
}

async function getSchemas(topicName){
    const schemas = {
        key: await fetchSchema(`${topicName}-key`, 1),
        value: await fetchSchema(`${topicName}-value`, 1)
    }
    return schemas
}

function fetchSchema(topic, version) {
    return new Promise((resolve, reject) => {
    request(
        `${registryUrl}/subjects/${topic}/versions/${version}/schema`,
        { rejectUnauthorized: false },
        (err, res, body) => {
            if (err) {
            console.log(err);
            }
            if (res.statusCode !== 200) {
            console.log(res);
            console.log(res.body);
            const error = res.body
            return reject(
                new Error(
                `Schema registry error: ${error.error_code} - ${error.message}`
                )
            )
            }
            resolve(JSON.parse(body))
        })
    })
}

module.exports = {
    POST
}