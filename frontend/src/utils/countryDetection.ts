// Stub for country detection - will be implemented with backend
// TODO: Replace with actual country detection when backend is ready

export const setUserCountry = (country: 'india' | 'foreign') => {
    localStorage.setItem('user_country', country);
};

export const getUserCountry = (): 'india' | 'foreign' => {
    return (localStorage.getItem('user_country') as 'india' | 'foreign') || 'foreign';
};

export const fetchUserCountry = async (userId?: string): Promise<'india' | 'foreign'> => {
    return getUserCountry();
};
