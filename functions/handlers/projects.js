const { db } = require('../utils/admin');

exports.getAllProjects = (req, res) => {
    db
        .collection('projects')
        .orderBy('projectName', 'asc')
        .get()
        .then(data => {
            let projects = [];
            data.forEach(doc => {
                projects.push({
                    projectId: doc.id,
                    ...doc.data()
                });
            });
            return res.json(projects);
        })
        .catch(error => console.error(error));
}

exports.postProject = (req, res) => {
    const newProject = {
        projectName: req.body.projectName,
        projectDescription: req.body.projectDescription,
        userHandle: req.user.handle
    }

    db
        .collection('projects')
        .add(newProject)
        .then(doc => {
            res.json({ message: `document ${doc.id} created succesfully` })
        })
        .catch(err => {
            res.status(500).json({ general: 'something went wrong.' })
            console.error(err);
        })
}

exports.getProject = (req, res) => {
    let projectData = {};
    db.doc(`/projects/${req.params.projectId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Project not found' });
            }
            projectData = doc.data();
            projectData.projectId = doc.id;
            return db
                .collection('pieces')
                .where('projectId', '==', projectData.projectId)
                .get()
        })
        .then((data) => {
            projectData.pieces = [];
            data.forEach((doc) => {
                projectData.pieces.push(doc.data());
            });
            return res.json(projectData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ general: 'Something went wrong. Please try again' });
        });
};

exports.deleteProject = (req, res) => {
    const document = db.doc(`/projects/${req.params.projectId}`);
    document.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Project not found' });
            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Project deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ general: 'Something went wrong. Please try again' });
        })
}