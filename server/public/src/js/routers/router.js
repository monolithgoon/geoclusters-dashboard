export const _navigateTo = url => {
   history.pushState(null, null, url);
   _clientSideRouter();
}

export const _clientSideRouter = async () => {

   const routes = [
      { path: "/", view: () => console.log("Viewing Default Page")},
      { path: "/landing", view: () => console.log("Viewing Landing Page")},
      { path: "/avg-map", view: () => console.log("Viewing AVG Map Page")},
      { path: "/legacy-agcs", view: () => console.log("Viewing the Manage Legacy Clusters Page")},
      { path: "/users", view: () => console.log("Viewing User Management Page")},
      { path: "/settings", view: () => console.log("Viewing Dashboard Settings Page")},
   ];

   // TEST EACH ROUTE FOR POTENTIAL MATCH
   const potentialMatches = routes.map(route => {
      return {
         route: route,
         isMatch: location.pathname === route.path
      };
   });

   let routeMatch = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

   // ROUTE NOT FOUND DEFAULT
   if (!routeMatch) {
      routeMatch = {
         route: routes[0],
         isMatch: true,
      };
   };

   console.log(routeMatch.route.view());

   console.log(potentialMatches);
};