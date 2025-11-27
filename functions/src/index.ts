/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { TranscoderServiceClient } from '@google-cloud/video-transcoder';
import { logger, setGlobalOptions } from "firebase-functions";
import { onDocumentUpdated /*, FirestoreEvent /* Change, */ } from "firebase-functions/v2/firestore";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
// import { onObjectFinalized } from "firebase-functions/storage";
import { getFirestore } from 'firebase-admin/firestore'; // , Timestamp, FieldValue, Filter
import { initializeApp } from "firebase-admin/app";

// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });



exports.onPubSubTranscoder = onMessagePublished({ topic: "projects/terraform-autosport-test4/topics/dev-autospotr-transcoder-notifications", region: "us-west1" }, async (event) => {
  
  initializeApp()

  const db = getFirestore("dev-fb-autospotr-firestore");
  const message = event.data.message;
  const jobId: string = message.json.job.name
  
  logger.log('Received Pub/Sub message:', jobId);

  const autoModelsRef = db.collection('autoModels');
  const autoModelsSS = await autoModelsRef.where('transcoderJob', '==', jobId).get();

  if (autoModelsSS.empty) {
    logger.error('No matching documents.');
    return;
  }  

  autoModelsSS.forEach(doc => {
    doc.ref.update({
        encodingState: 'complete'
    });
  });
  // // Access message attributes
  // const attributes = message.attributes;
  // if (attributes) {
  //   logger.log('Message attributes:', attributes);
  // }

  logger.log('Received Pub/Sub message Complete');

  return null; // Important: Return a promise or null to indicate completion

});


exports.documentUpdateMake = onDocumentUpdated({ 
  document: "autoModels/{modelId}",
  database: "dev-fb-autospotr-firestore", 
  region: "us-west1"
}, async (event) => {
 
  const snapshot = event.data;

  if (!snapshot) {
    logger.log('No data associated with the event');
    return;
  }

  const transcoderServiceClient = new TranscoderServiceClient();

  const oldData = event.data!.before.data();
  const newData = event.data!.after.data();

  // Find newly added fields
  const currentFields = Object.keys(newData)
  const addedFields = currentFields.filter(
    (key) => !Object.prototype.hasOwnProperty.call(oldData, key)
  );

  if (addedFields.length > 0) {

    logger.log(`New fields added to model document ${event.params.modelId}:`, addedFields);

    if (addedFields.find(field => field == "videoUrl") && !currentFields.find(field => field == "encodingState")) {
     
      await snapshot.after.ref.update({
        encodingState: 'init'
      });

      return;

    }

    if (currentFields.find(field => field == "encodingState") && newData["encodingState"] == "init" ) {

      logger.log('Run Encoding Process');

      const bucket = "gs://dev-autospotr-videos"
      const sourceFolder = "model-videos"
      const outputFolder = "model-videos-rendered"

      logger.log('Run Encoding Process:', event.data?.after.id);

      const fileName = stripQueryString(getFilenameFromUrl(decodeURIComponent(newData["videoUrl"]))!);

      const inputUri = `${bucket}/${sourceFolder}/${fileName}`;
      const outputUri = `${bucket}/${outputFolder}/${event.data?.after.id}/`;

      const projectId = "terraform-autosport-test4"
      const location = 'us-west1'; 

      const manifestType: "HLS" | "DASH" | null | undefined = "HLS";

      const request = {

        parent: transcoderServiceClient.locationPath(projectId, location),
        job: {

          inputUri: inputUri,
          outputUri: outputUri,

          // // Example: Using a preset template
          // templateId: 'preset/web-hd', 

          config: {
            elementaryStreams: [
              {
                key: "video-stream0",
                videoStream: {
                  h264: {
                    widthPixels:      170,
                    heightPixels:       96,
                    bitrateBps:       130000,
                    frameRate:        15,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:      "yuv420p",
                    rateControlMode:  "crf",
                    crfLevel:         10,
                    profile:          "high",
                    preset:           "medium",
                  }
                }
              },
              {
                key: "video-stream1",
                videoStream: {
                  h264: {
                    widthPixels: 256,
                    heightPixels: 144,
                    bitrateBps: 240000,
                    frameRate: 30,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium"
                  }
                }
              },
              {
                key: "video-stream2",
                videoStream: {
                  h264: {
                    widthPixels: 416,
                    heightPixels: 234,
                    bitrateBps: 300000,
                    frameRate: 30,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium",
                  }
                }
              },
              {
                key: "video-stream3",
                videoStream: {
                  h264: {
                    widthPixels: 640,
                    heightPixels: 360,
                    bitrateBps: 400000,
                    frameRate: 30,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium",
                  }
                }
              },
              {
                key: "video-stream4",
                videoStream: {
                  h264: {
                    widthPixels: 768,
                    heightPixels: 432,
                    bitrateBps: 1100000,
                    frameRate: 30,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium",
                  }
                }
              },
              {
                key: "video-stream5",
                videoStream: {
                  h264: {
                    widthPixels: 960,
                    heightPixels: 540,
                    bitrateBps: 2200000,
                    frameRate: 30,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium",
                  }
                }
              },
              {
                key: "video-stream6",
                videoStream: {
                  h264: {
                    widthPixels: 1280,
                    heightPixels: 720,
                    bitrateBps: 3300000,
                    frameRate: 30,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium",
                  }
                }
              },
              {
                key: "video-stream7",
                videoStream: {
                  h264: {
                    widthPixels: 1280,
                    heightPixels: 720,
                    bitrateBps: 5500000,
                    frameRate: 60,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium",
                  }
                }
              },
              {
                key: "video-stream8",
                videoStream: {
                  h264: {
                    widthPixels: 1920,
                    heightPixels: 1080,
                    bitrateBps: 6000000,
                    frameRate: 60,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium",
                  }
                }
              },
              {
                key: "video-stream9",
                videoStream: {
                  h264: {
                    widthPixels: 1920,
                    heightPixels: 1080,
                    bitrateBps: 9000000,
                    frameRate: 60,
                    gopDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                    pixelFormat:  "yuv420p",
                    rateControlMode: "crf",
                    crfLevel: 10,
                    profile: "high",
                    preset: "medium",
                  }
                }
              },
              {
                key: "audio-stream0",
                audioStream: {
                  codec: "aac",
                  bitrateBps: 32000
                }
              },
              {
                key: "audio-stream1",
                audioStream: {
                  codec: "aac",
                  bitrateBps: 64000
                }
              },
              {
                key: "audio-stream2",
                audioStream: {
                  codec: "aac",
                  bitrateBps: 96000
                }
              },
              {
                key: "audio-stream3",
                audioStream: {
                  codec: "aac",
                  bitrateBps: 128000
                }
              },
              {
                key: "audio-stream4",
                audioStream: {
                  codec: "aac",
                  bitrateBps: 160000
                }
              },
              {
              key: "audio-stream5",
                audioStream: {
                  codec: "aac",
                  bitrateBps: 384000
                }
              }
            ],
            muxStreams: [
              {
                key: "1",
                container: "ts",
                elementaryStreams: ["video-stream0", "audio-stream0"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "2",
                container: "ts",
                elementaryStreams: ["video-stream1", "audio-stream1"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "3",
                container: "ts",
                elementaryStreams: ["video-stream2", "audio-stream1"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "4",
                container: "ts",
                elementaryStreams: ["video-stream3", "audio-stream1"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "5",
                container: "ts",
                elementaryStreams: ["video-stream4", "audio-stream2"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "6",
                container: "ts",
                elementaryStreams: ["video-stream5", "audio-stream3"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "7",
                container: "ts",
                elementaryStreams: ["video-stream6", "audio-stream3"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "8",
                container: "ts",
                elementaryStreams: ["video-stream7", "audio-stream4"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "9",
                container: "ts",
                elementaryStreams: ["video-stream8", "audio-stream4"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              },
              {
                key: "10",
                container: "ts",
                elementaryStreams: ["video-stream9", "audio-stream5"],
                segmentSettings: {
                  segmentDuration: {
                      seconds: 4,
                      // nanos: 0 // Optional
                    },
                }
              }
            ],
            manifests: [{
              fileName: "manifest.m3u8",
              type: manifestType,
              muxStreams: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
            }],
            pubsubDestination: {
              topic: "projects/terraform-autosport-test4/topics/dev-autospotr-transcoder-notifications",
            }
          }

        }

      };

      try {
        const [job] = await transcoderServiceClient.createJob(request);
        logger.log(`Transcoding job created: ${job.name}`);
        await snapshot.after.ref.update({
          encodingState: 'processing',
          transcoderJob: job.name
        });
      } catch (error) {
        logger.error('Error creating transcoding job:', error);
      } 
    }

  }

});

// exports.onStorageFileAdded = onObjectFinalized({ bucket: "dev-autospotr-videos", region: "us-west1" }, (event) => {
  
//   // const fileBucket = event.data.bucket; // Storage bucket containing the file.
//   const filePath = event.data.name; // File path in the bucket.
//   // const contentType = event.data.contentType; // File content type.

//   logger.log("onStroageFileAdded:", filePath);
      //return null
// });


function getFilenameFromUrl(url: string): string | null {
  try {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;

    // Get the last segment after the last '/'
    const lastSlashIndex = pathname.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      // No slashes in the path, the whole path is potentially the filename
      return pathname;
    } else if (lastSlashIndex === pathname.length - 1) {
      // URL ends with a slash, no filename present
      return null; 
    } else {
      // Extract the part after the last slash
      return pathname.substring(lastSlashIndex + 1);
    }
  } catch (error) {
    console.error("Invalid URL provided:", error);
    return null;
  }
}

function stripQueryString(url: string): string {
  const queryStartIndex = url.indexOf('?');
  if (queryStartIndex !== -1) {
    return url.slice(0, queryStartIndex);
  }
  return url; // No query string found, return original URL
}