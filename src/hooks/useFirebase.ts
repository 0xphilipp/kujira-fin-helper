import {db, libs} from "../firebase/fa";

const useFirebase = () => {
    return {
        async getDocuments(path: string, ...paths: string[]) {
            const {query, collection, getDocs} = libs.firestore;
            const q = query(collection(db, path, ...paths));
            // , where('market', "==", 'abc')
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(d => d.data());
        },
        async addDocuments(objects: any, path: string, ...paths: string[]) {
            const collection = libs.firestore.collection(db, path, ...paths);
            objects.forEach((o: any) => libs.firestore.addDoc(collection, o))
        }
    }
}

export default useFirebase;