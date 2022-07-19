import contractJson from '../data/contracts.json';

const useContracts = () => {
    return contractJson as Contract[];
}

export default useContracts;