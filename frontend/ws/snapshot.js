
export class SnapshotBuffer
{
    constructor(followObject)
    {
        this.BUFFER_SIZE = 5;
        this.snapshotBuffer = [];
        this.followObject = followObject;
        this.lastKnowState = null;
    }

    addSnapshot(snapshot)
    {
        snapshot.timestamp = performance.now()
        this.snapshotBuffer.push(snapshot);
        this.lastKnowState = snapshot;

        while (this.snapshotBuffer.length > 2)
        {
            this.snapshotBuffer.shift();
        }
    }

    lerp(start, end, t)
    {
        return start + (end - start) * t;
    }

    interpolate()
    {

        if (this.snapshotBuffer.length < 2) return;

        const now = performance.now() - 100;
        let oldId = 0;

        for (let iter = 0; iter < this.snapshotBuffer.length - 1; iter++)
        {
            if (this.snapshotBuffer[iter + 1].timestamp > now)
            {
                oldId = iter;
                break;
            }
        }

        const oldSnapshot = this.snapshotBuffer[oldId];
        const newSnapshot = this.snapshotBuffer[oldId + 1];

        const delta = newSnapshot.timestamp - oldSnapshot.timestamp;

        const t = Math.min(1, (now - oldSnapshot.timestamp) / delta);

        this.followObject.x = this.lerp(oldSnapshot.x, newSnapshot.x, t);
        this.followObject.y = this.lerp(oldSnapshot.y, newSnapshot.y, t);
        this.followObject.dir = this.lerp(oldSnapshot.dir, newSnapshot.dir, t);
    }
}