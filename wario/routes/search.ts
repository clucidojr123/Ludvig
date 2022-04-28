import express from "express";
import fetch from 'node-fetch';
import { isAuthenticated, isVerified } from "../util/passport";
const ES_URI = process.env.ES_URI || "http://localhost:9200";
const ES_INDEX = process.env.ES_INDEX || "ludvig";

const createSearchQuery = (search: string): Record<any, any> => {
    return {
        "query": {
          "bool": {
            "should": [
              {
                  "match_phrase": {
                      "content": search
                  }
              },
              {
                  "match_phrase": {
                      "name": search
                  }
              }
            ],
            "minimum_should_match": 1
          }
        },
          "highlight": {
            "fields": {
                "content": {
                    "type": "fvh"
                },
                "name": {
                    "type": "fvh"
                }
            }
        }
      }
}

const createSuggestQuery = (search: string): Record<any, any> => {
    return {
        "suggest" : {
          "autocomplete" : {
            "prefix" : search,
            "completion" : {
              "field" : "suggest"
            }
          }
        }
      }
}

const router = express.Router();

router.get("/search", isAuthenticated, isVerified, async (req, res, next) => {
    if (!req.query.q) {
        res.status(400)
            .json({
                error: true,
                message: "Missing query param",
            })
            .end();
        return;
    }
    const result = await fetch(`${ES_URI}/${ES_INDEX}/_search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(createSearchQuery(req.query.q as string))
    });
    const data = await result.json();
    const hits = data.hits?.hits;
    if (result.status !== 200 || !data || !Array.isArray(hits)) {
        res.status(400)
            .json({
                error: true,
                message: "Error when querying",
            })
            .end();
        return;
    }

    const returnHits = hits.map((val) => {
        const snippet = val.highlight?.content ?  val.highlight.content[0] : val.highlight?.name ?  val.highlight.name[0] : "bruh!"
        return {
            docid: val._id || "bruh!",
            name: val._source?.name || "bruh!",
            snippet
        }
    });

    res.json(returnHits).end();
});

router.get("/suggest", isAuthenticated, isVerified, async (req, res, next) => {
    if (!req.query.q) {
        res.status(400)
            .json({
                error: true,
                message: "Missing query param",
            })
            .end();
        return;
    }
    const result = await fetch(`${ES_URI}/${ES_INDEX}/_search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(createSuggestQuery(req.query.q as string))
    });
    const data = await result.json();
    const suggest = data.suggest?.autocomplete[0]?.options;
    if (result.status !== 200 || !data || !Array.isArray(suggest)) {
        res.status(400)
            .json({
                error: true,
                message: "Error when querying",
            })
            .end();
        return;
    }

    const returnSuggest = suggest.map((val) => {
        return val.text || "bruh!"
    });

    res.json(returnSuggest).end();
});

export default router;
