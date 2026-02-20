const { spawn } = require('child_process');
const path = require('path');

exports.uploadDataset = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;

        // Trigger model retraining
        // In a real app, this should be a background job
        const trainScriptPath = path.join(__dirname, '../../ml/train_model.py');
        const trainProcess = spawn('python', [trainScriptPath, filePath]);

        let dataString = '';

        trainProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        trainProcess.on('close', (code) => {
            console.log(`Training process exited with code ${code}`);
            // We return success immediately after upload, retraining happens in background usually
            // But here we wait for simple demo
            res.json({
                message: 'Dataset uploaded and model training started',
                filename: req.file.filename,
                trainingOutput: dataString
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
