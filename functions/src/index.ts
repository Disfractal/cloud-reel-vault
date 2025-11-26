/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {
  onDocumentUpdated,
  // Change,
  // FirestoreEvent
} from "firebase-functions/v2/firestore";
import { logger, setGlobalOptions } from "firebase-functions";
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

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

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

  const oldData = event.data!.before.data();
  const newData = event.data!.after.data();

  // Find newly added fields
  const currentFields = Object.keys(newData)
  const addedFields = currentFields.filter(
    (key) => !Object.prototype.hasOwnProperty.call(oldData, key)
  );

  if (addedFields.length > 0) {

    logger.log(`New fields added to model document ${event.params.modelId}:`, addedFields);
    // Perform further actions with the added fields
    if (addedFields.find(field => field == "videoUrl") && !currentFields.find(field => field == "encodingState")) {
      await snapshot.after.ref.update({
        encodingState: 'init'
      });
      return;
    }

    if (currentFields.find(field => field == "encodingState") && newData["encodingState"] == "init" ) {

      logger.log('Run Encoding Process');

      await snapshot.after.ref.update({
        encodingState: 'processing'
      });

      

      return;

    }

  }



  // access a particular field as you would any JS property
  //const name = newValue.name;

  // perform more operations ...

});
