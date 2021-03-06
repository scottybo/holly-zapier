const sample = require('../samples/sample-upload-media');
const request = require('request');
const FormData = require('form-data');
const hydrators = require('../hydrators');

const uploadMedia = (z, bundle) => {
    
    const formData = new FormData();
    
    formData.append('team_id', bundle.inputData.team_id);
    
    // media will in fact be an url where the file data can be downloaded from
    // which we do via a stream created by NPM's request package
    // (form-data doesn't play nicely with z.request)
    //formData.append('media_url', request(bundle.inputData.media_url));
    //formData.append('folder_id', request(bundle.inputData.folder_id));

    return z.request({
        method: 'POST',
        url: `${process.env.HOLLY_ENDPOINT}/media/upload/remote`,
        body: {
            media_url: bundle.inputData.media_url,
            folder_id: bundle.inputData.folder_id,
            team_id: bundle.inputData.team_id,
        }
    })
    .then((response) => {
        const media = response.json;

        // Make it possible to use the actual uploaded (or online converted)
        // file in a subsequent action. No need to download it now, so again
        // dehydrating like in ../triggers/newFile.js
        media.file = z.dehydrateFile(hydrators.downloadFile, {
            media_url: media.url,
        });

        return media;
    });
};

module.exports = {
    key: 'media_upload',
    noun: 'Media',

    display: {
        label: 'Upload Media',
        description: 'Uploads media file to a folder in your Media Library'
    },

    operation: {
        inputFields: [
            {key: 'team_id', label:'Team', required: true, dynamic: 'list_teams.id.name'},
            {key: 'folder_id', label:'Folder', required: true, dynamic: 'list_media_folders.id.name'},
            {key: 'media_url', required: true, type: 'file', label: 'File'},
        ],
        perform: uploadMedia,
        sample: sample,
        outputFields: [
            {key: 'file', type: 'file', label: 'File'},
            {key: 'id', type: 'string', label: 'Media id'},
            {key: 'url', type: 'string', label: 'Uploaded media URL'},
        ],
    }
};
