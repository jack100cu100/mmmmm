import { Outlet, useLocation } from 'react-router';

const Layout = () => {
    const location = useLocation();
    const isIndexPath = location.pathname === '/';

    return (
        <div className={isIndexPath ? '' : 'flex min-h-screen flex-col items-center bg-white'}>
            <Outlet />
        </div>
    );
};

export default Layout;
