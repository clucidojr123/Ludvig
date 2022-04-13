import * as Minio from 'minio';

export const customPolicy = {
    Version: '2012-10-17',
    Statement: [
        {
            Action: ['s3:GetBucketLocation', 's3:ListBucket'],
            Effect: 'Allow',
            Principal: {
                AWS: ['*'],
            },
            Resource: ['arn:aws:s3:::doc-media'],
        },
        {
            Action: ['s3:GetObject'],
            Effect: 'Allow',
            Principal: {
                AWS: ['*'],
            },
            Resource: ['arn:aws:s3:::doc-media/*'],
        },
    ],
};

class S3Handler {
    client?: Minio.Client;

    initialize(client: Minio.Client) {
        this.client = client;
    }

    async putObject(bucketName: string, objectName: string, data: Buffer, metadata: Minio.ItemBucketMetadata) {
        await this.client?.putObject(bucketName, objectName, data, metadata);
    }

}

export const S3Instance = new S3Handler();
