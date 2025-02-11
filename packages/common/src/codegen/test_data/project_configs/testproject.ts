import { Feature, ProjectConfig } from "@patchworkdev/common/types";

const nftcommentsProjectConfig: ProjectConfig = {
    name: "nftcomments",
    scopes: [
        {
            name: "nftcomments",
            whitelist: true,
            userAssign: true,
            userPatch: true,
        }
    ],
    contracts: {
        "commentpatch": {
            scopeName: "nftcomments",
            name: "CommentPatch",
            symbol: "CPATCH",
            baseURI: "https://api.nftcomments.app/",
            schemaURI: "https://api.nftcomments.app/schemas/commentpatch.json",
            imageURI: "https://api.nftcomments.app/assets/commentpatch/{tokenID}",
            fields: [
                {
                    id: 1,
                    key: "comments",
                    type: "literef",
                    description: "Comments list",
                    arrayLength: 0,
                },
                {
                    id: 2,
                    key: "metadata",
                    type: "uint256",
                    description: "Additional metadata",
                }
            ],
            features: [Feature.PATCH, Feature.REVERSIBLE, Feature.LITEREF],
            fragments: ["comment", "commentthread"]
        },
        "comment": {
            scopeName: "nftcomments",
            name: "Comment",
            symbol: "COMMENT",
            baseURI: "https://api.nftcomments.app/",
            schemaURI: "https://api.nftcomments.app/schemas/comment.json",
            imageURI: "https://api.nftcomments.app/assets/comment/{tokenID}",
            fields: [
                {
                    id: 1,
                    key: "content",
                    type: "string",
                    description: "Comment content",
                },
                {
                    id: 2,
                    key: "timestamp",
                    type: "uint256",
                    description: "Comment timestamp",
                },
                {
                    id: 3,
                    key: "author",
                    type: "address",
                    description: "Comment author address",
                }
            ],
            features: [Feature.MINTABLE, Feature.FRAGMENTSINGLE],
            fragments: []
        },
        "commentthread": {
            scopeName: "nftcomments",
            name: "CommentThread",
            symbol: "THREAD",
            baseURI: "https://api.nftcomments.app/",
            schemaURI: "https://api.nftcomments.app/schemas/commentthread.json",
            imageURI: "https://api.nftcomments.app/assets/thread/{tokenID}",
            fields: [
                {
                    id: 1,
                    key: "replies",
                    type: "literef",
                    description: "Thread replies",
                    arrayLength: 0,
                },
                {
                    id: 2,
                    key: "parentComment",
                    type: "uint256",
                    description: "Parent comment ID",
                }
            ],
            features: [Feature.MINTABLE, Feature.FRAGMENTSINGLE, Feature.LITEREF],
            fragments: []
        }
    },
    plugins: [
        { name: 'ponder' },
        { name: 'react' }
    ],
};

export default nftcommentsProjectConfig;
