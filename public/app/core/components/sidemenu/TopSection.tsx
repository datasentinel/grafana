import React, { FC } from 'react';
import _ from 'lodash';
import TopSectionItem from './TopSectionItem';
import config from '../../config';
import { contextSrv } from 'app/core/services/context_srv';
import SignIn from './SignIn';
import BottomNavLinks from './BottomNavLinks';

const TopSection: FC<any> = () => {
  const navTree = _.cloneDeep(config.bootData.navTree);
  const mainLinks = _.filter(navTree, item => !item.hideFromMenu);
  const isAdmin = contextSrv.user.isGrafanaAdmin;
  const bottomNav = _.filter(navTree, item => item.hideFromMenu);
  const isSignedIn = contextSrv.isSignedIn;
  const user = contextSrv.user;

  if (isAdmin) {
    return (
      <div className="sidemenu__top">
        {mainLinks.map((link, index) => {
          return <TopSectionItem link={link} key={`${link.id}-${index}`} />;
        })}
      </div>
    );
  } else {
    return (
      <div className="sidemenu__top">
        {!isSignedIn && <SignIn />}
        {bottomNav.map((link: any, index) => {
          return <BottomNavLinks link={link} user={user} key={`${link.id}-${index}`} />;
        })}
      </div>
    );
  }
};

export default TopSection;
