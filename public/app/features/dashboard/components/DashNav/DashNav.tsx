// Libaries
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Utils & Services
import { appEvents } from 'app/core/app_events';
import { PlaylistSrv } from 'app/features/playlist/playlist_srv';

// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { Tooltip, PanelMenuItem } from '@grafana/ui';

// State
import { updateLocation } from 'app/core/actions';

// Types
import { DashboardModel } from '../../state';
import { StoreState } from 'app/types';

import { contextSrv, User } from 'app/core/services/context_srv';
import _ from 'lodash';
import { PanelHeaderMenuItem } from '../../dashgrid/PanelHeader/PanelHeaderMenuItem';

export interface OwnProps {
  dashboard: DashboardModel;
  editview: string;
  isEditing: boolean;
  isFullscreen: boolean;
  $injector: any;
  updateLocation: typeof updateLocation;
  onAddPanel: () => void;
}

export interface StateProps {
  location: any;
}

type Props = StateProps & OwnProps;

const HOME_PAGE = 'Home';
const DB_TIME = 'Workload';
const PG_INSTANCES = 'PG instances';
const TOP_QUERIES = 'Top queries';
const DATA_SIZE = 'Data size';
const SERVERS = 'Servers';
const AGENTS = 'Agents';
const ROLES = 'Roles';
const USERS = 'Users';
const EVENTS = 'Events';
const SETTINGS = 'Settings';
const USER_PROFILE = 'userProfile';
const DOCUMENTATION = 'Documentation';
const RELEASE_NOTES = 'Release Notes';
const ABOUT = 'About';

// class Organization {
//   id: number;
//   name: string;
//   selected = false;
//   role = 'admin';

//   constructor(id: number, name: string) {
//     this.id = id;
//     this.name = name;
//   }
// }

// class GfUser {
//   id: number;
//   name = '';
//   mail = '';
//   login = '';
//   role = 'No restriction';
//   privilege = 'admin';
//   profile = 'data admin';
//   password = '';
//   admin = false;
//   projects: Organization[] = [];
// }

export class DashNav extends PureComponent<Props> {
  playlistSrv: PlaylistSrv;
  user: User;
  menu: PanelMenuItem[] = [];
  toolMenu: PanelMenuItem[] = [];

  items = [
    { title: HOME_PAGE, active: false, url: '', icon: 'fa fa-home', dashboard: 'home' },
    { title: DB_TIME, active: false, url: '', icon: 'fa fa-area-chart', dashboard: 'db-workload' },
    { title: TOP_QUERIES, active: false, url: '', icon: 'fa fa-cogs', dashboard: 'sql-stats' },
    { title: PG_INSTANCES, active: false, url: '', icon: 'fa fa-database', dashboard: 'registered-pg-instances' },
    { title: SERVERS, active: false, url: '', icon: 'fa fa-server', dashboard: 'registered-servers' },
    { title: DATA_SIZE, active: false, url: '', icon: 'fa fa-line-chart', dashboard: 'data-size' },
    { title: AGENTS, active: false, url: '', icon: 'fa fa-link', dashboard: 'agents' },
    { title: ROLES, active: false, url: '', icon: 'fa fa-filter', dashboard: 'access-roles' },
    { title: USERS, active: false, url: '', icon: 'fa fa-users', dashboard: 'user-list' },
    { title: DOCUMENTATION, active: false, url: '', icon: 'fa fa-book', dashboard: 'documentation' },
    { title: RELEASE_NOTES, active: false, url: '', icon: 'fa fa-newspaper-o', dashboard: 'release-notes' },
    { title: ABOUT, active: false, url: '', icon: 'fa fa-info', dashboard: 'about' },
  ];

  constructor(props: Props) {
    super(props);
    this.playlistSrv = this.props.$injector.get('playlistSrv');
    this.user = contextSrv.user;

    appEvents.on(USER_PROFILE, this.onReceivedUserProfile.bind(this));

    this.loadDatasentinelMenu();
    this.loadDatasentinelToolMenu();
  }

  loadUserProfile() {
    const userProf = localStorage.getItem(USER_PROFILE);
    if (userProf) {
      try {
        const usr = JSON.parse(userProf);

        let includeConfiguration = true;
        if (usr.profile !== 'data admin' || usr.privilege !== 'admin') {
          includeConfiguration = false;
        }

        this.loadDatasentinelToolMenu(includeConfiguration);

        includeConfiguration = true;
        if (usr.profile !== 'data admin') {
          includeConfiguration = false;
        }
        this.loadDatasentinelMenu(includeConfiguration);
      } catch (e) {
        console.log(e);
        localStorage.removeItem(USER_PROFILE);
      }
    }
  }

  onReceivedUserProfile(event: any) {
    this.loadUserProfile();
    this.forceUpdate();
  }

  loadDatasentinelToolMenu(includeConfiguration = true) {
    this.toolMenu = [];

    if (includeConfiguration) {
      this.toolMenu.push({ text: AGENTS, iconClassName: 'fa fa-link', onClick: this.onViewAgents });
      this.toolMenu.push({ text: ROLES, iconClassName: 'fa fa-filter', onClick: this.onViewRoles });
      this.toolMenu.push({ text: USERS, iconClassName: 'fa fa-users', onClick: this.onViewUsers });
      this.toolMenu.push({ type: 'divider' });
    }

    this.toolMenu.push({ text: DOCUMENTATION, iconClassName: 'fa fa-book', onClick: this.onViewDocumentation });
    this.toolMenu.push({ text: RELEASE_NOTES, iconClassName: 'fa fa-newspaper-o', onClick: this.onViewReleaseNotes });
    this.toolMenu.push({ type: 'divider' });
    this.toolMenu.push({ text: ABOUT, iconClassName: 'fa fa-info', onClick: this.onViewAbout });
  }

  loadDatasentinelMenu(includeConfiguration = true) {
    this.menu = [];

    this.menu.push({ text: HOME_PAGE, iconClassName: 'fa fa-home', onClick: this.onViewHome });
    this.menu.push({ text: DB_TIME, iconClassName: 'fa fa-area-chart', onClick: this.onViewWorkload });
    this.menu.push({ text: TOP_QUERIES, iconClassName: 'fa fa-cogs', onClick: this.onViewQueries });

    if (includeConfiguration) {
      this.menu.push({ type: 'divider' });
      this.menu.push({ text: PG_INSTANCES, iconClassName: 'fa fa-database', onClick: this.onViewPgInstances });
      this.menu.push({ text: SERVERS, iconClassName: 'fa fa-server', onClick: this.onViewServer });
      this.menu.push({ type: 'divider' });
      this.menu.push({ text: DATA_SIZE, iconClassName: 'fa fa-line-chart', onClick: this.onViewDataSize });
    }
  }

  onViewAgents = () => {
    appEvents.emit('home-buttons', { dashboard: 'agents' });
  };

  onViewRoles = () => {
    appEvents.emit('home-buttons', { dashboard: 'access-roles' });
  };

  onViewUsers = () => {
    appEvents.emit('home-buttons', { dashboard: 'user-list' });
  };

  onViewDocumentation = () => {
    window.open('https://doc.datasentinel.io/index.html');
  };

  onViewReleaseNotes = () => {
    window.open('https://doc.datasentinel.io/release-notes.html');
  };

  onViewAbout = () => {
    appEvents.emit('home-buttons', { dashboard: 'about' });
  };

  onViewHome = () => {
    appEvents.emit('home-buttons', { dashboard: 'home' });
  };

  onViewWorkload = () => {
    appEvents.emit('home-buttons', { dashboard: 'db-workload' });
  };

  onViewQueries = () => {
    appEvents.emit('home-buttons', { dashboard: 'sql-stats' });
  };

  onViewPgInstances = () => {
    appEvents.emit('home-buttons', { dashboard: 'registered-pg-instances' });
  };

  onViewServer = () => {
    appEvents.emit('home-buttons', { dashboard: 'registered-servers' });
  };

  onViewDataSize = () => {
    appEvents.emit('home-buttons', { dashboard: 'data-size' });
  };

  onDahboardNameClick = () => {
    appEvents.emit('show-dash-search');
  };

  onFolderNameClick = () => {
    appEvents.emit('show-dash-search', {
      query: 'folder:current',
    });
  };

  onClose = () => {
    if (this.props.editview) {
      this.props.updateLocation({
        query: { editview: null },
        partial: true,
      });
    } else {
      this.props.updateLocation({
        query: { panelId: null, edit: null, fullscreen: null, tab: null },
        partial: true,
      });
    }
  };

  onToggleTVMode = () => {
    appEvents.emit('toggle-kiosk-mode');
  };

  onSave = () => {
    const { $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');
    dashboardSrv.saveDashboard();
  };

  onOpenSettings = () => {
    this.props.updateLocation({
      query: { editview: 'settings' },
      partial: true,
    });
  };

  onStarDashboard = () => {
    const { dashboard, $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then((newState: any) => {
      dashboard.meta.isStarred = newState;
      this.forceUpdate();
    });
  };

  onPlaylistPrev = () => {
    this.playlistSrv.prev();
  };

  onPlaylistNext = () => {
    this.playlistSrv.next();
  };

  onPlaylistStop = () => {
    this.playlistSrv.stop();
    this.forceUpdate();
  };

  onOpenShare = () => {
    const $rootScope = this.props.$injector.get('$rootScope');
    const modalScope = $rootScope.$new();
    modalScope.tabIndex = 0;
    modalScope.dashboard = this.props.dashboard;

    appEvents.emit('show-modal', {
      src: 'public/app/features/dashboard/components/ShareModal/template.html',
      scope: modalScope,
    });
  };

  onFullScreen = () => {
    const fullElement = document.getElementById('fullScreen');

    if (document.fullscreenEnabled) {
      if (!document.fullscreenElement) {
        fullElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    } else {
      console.log('Your browser does not support full screen');
    }
  };

  getTitle(): string {
    const url: string = window.location.href;
    let name: string = HOME_PAGE;

    if (url.indexOf('/db-workload') > -1) {
      name = DB_TIME;
    } else if (url.indexOf('/data-size') > -1) {
      name = DATA_SIZE;
    } else if (url.indexOf('/registered-pg-instance') > -1 || url.indexOf('/pg-instance') > -1) {
      name = PG_INSTANCES;
    } else if (url.indexOf('/sql-stat') > -1 || url.indexOf('/query') > -1) {
      name = TOP_QUERIES;
    } else if (url.indexOf('/events') > -1) {
      name = EVENTS;
    } else if (url.indexOf('/settings') > -1) {
      name = SETTINGS;
    } else if (url.indexOf('/agents') > -1) {
      name = AGENTS;
    } else if (url.indexOf('/registered-servers') > -1 || url.indexOf('/server') > -1) {
      name = SERVERS;
    } else if (url.indexOf('/user') > -1) {
      name = USERS;
    } else if (url.indexOf('/access-role') > -1) {
      name = ROLES;
    }

    return name;
  }

  getCssIcon(): string {
    const name: string = this.getTitle();

    const module = _.find(this.items, item => item.title === name);

    return module.icon + ' fg-pgsentinel';
  }

  renderDatasentinelToolMenu() {
    return (
      <>
        <div>
          <span className="panel-header">
            <span className="panel-title" style={{ marginTop: '20px' }}>
              <span
                style={{
                  fontSize: '18px',
                  textAlign: 'center',
                  marginTop: '-10px',
                  width: '50px',
                  color: '#263c53',
                  cursor: 'pointer',
                }}
                data-toggle="dropdown"
              >
                <i className="fa fa-cog" />
              </span>
              <span className="panel-menu-container dropdown">
                <span className="fa fa-caret-down panel-menu-toggle" data-toggle="dropdown" />
                <ul className="dropdown-menu dropdown-menu--menu panel-menu" role="menu">
                  {this.toolMenu.map((menuItem, idx: number) => {
                    return (
                      <PanelHeaderMenuItem
                        key={`${menuItem.text}${idx}`}
                        type={menuItem.type}
                        text={menuItem.text}
                        iconClassName={menuItem.iconClassName}
                        onClick={menuItem.onClick}
                        shortcut={menuItem.shortcut}
                      />
                    );
                  })}
                </ul>
              </span>
            </span>
          </span>
        </div>
      </>
    );
  }

  renderDatasentinelMenu() {
    const divStyle = { width: '170px', marginTop: '20px', marginLeft: '-30px' };

    return (
      <>
        <div>
          <span className="panel-header">
            <span className="panel-title" style={divStyle}>
              <span className="panel-title-text" data-toggle="dropdown">
                <h4 style={{ color: '#263c53' }}>
                  <i className={`${this.getCssIcon()}`} />
                  &nbsp;&nbsp;{`${this.getTitle()}`}
                </h4>
              </span>
              <span className="panel-menu-container dropdown">
                <span className="fa fa-caret-down panel-menu-toggle" data-toggle="dropdown" />
                <ul className="dropdown-menu dropdown-menu--menu panel-menu" role="menu">
                  {this.menu.map((menuItem, idx: number) => {
                    return (
                      <PanelHeaderMenuItem
                        key={`${menuItem.text}${idx}`}
                        type={menuItem.type}
                        text={menuItem.text}
                        iconClassName={menuItem.iconClassName}
                        onClick={menuItem.onClick}
                        shortcut={menuItem.shortcut}
                      />
                    );
                  })}
                </ul>
              </span>
            </span>
          </span>
        </div>
      </>
    );
  }

  renderDashboardTitleSearchButton() {
    const { dashboard } = this.props;

    const folderTitle = dashboard.meta.folderTitle;
    const haveFolder = dashboard.meta.folderId > 0;

    return (
      <>
        <div>
          <div className="navbar-page-btn">
            {!this.isInFullscreenOrSettings && <i className="gicon gicon-dashboard" />}
            {haveFolder && (
              <>
                <a className="navbar-page-btn__folder" onClick={this.onFolderNameClick}>
                  {folderTitle}
                </a>
                <i className="fa fa-chevron-right navbar-page-btn__folder-icon" />
              </>
            )}
            <a onClick={this.onDahboardNameClick}>
              {dashboard.title} <i className="fa fa-caret-down navbar-page-btn__search" />
            </a>
          </div>
        </div>
        {this.isSettings && <span className="navbar-settings-title">&nbsp;/ Settings</span>}
        <div className="navbar__spacer" />
      </>
    );
  }

  get isInFullscreenOrSettings() {
    return this.props.editview || this.props.isFullscreen;
  }

  get isSettings() {
    return this.props.editview;
  }

  renderBackButton() {
    return (
      <div className="navbar-edit">
        <Tooltip content="Go back (Esc)">
          <button className="navbar-edit__back-btn" onClick={this.onClose}>
            <i className="fa fa-arrow-left" />
          </button>
        </Tooltip>
      </div>
    );
  }

  render() {
    const { dashboard, onAddPanel, location, $injector } = this.props;
    const { canStar, canSave, canShare, showSettings, isStarred } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;

    return (
      <div className="navbar">
        {this.isInFullscreenOrSettings && this.renderBackButton()}
        {this.renderDatasentinelMenu()}
        {this.renderDatasentinelToolMenu()}
        {this.user.isGrafanaAdmin && this.renderDashboardTitleSearchButton()}
        {!this.user.isGrafanaAdmin && <div className="navbar__spacer" />}

        {this.playlistSrv.isPlaying && this.user.isGrafanaAdmin && (
          <div className="navbar-buttons navbar-buttons--playlist">
            <DashNavButton
              tooltip="Go to previous dashboard"
              classSuffix="tight"
              icon="fa fa-step-backward"
              onClick={this.onPlaylistPrev}
            />
            <DashNavButton
              tooltip="Stop playlist"
              classSuffix="tight"
              icon="fa fa-stop"
              onClick={this.onPlaylistStop}
            />
            <DashNavButton
              tooltip="Go to next dashboard"
              classSuffix="tight"
              icon="fa fa-forward"
              onClick={this.onPlaylistNext}
            />
          </div>
        )}

        <div className="navbar-buttons navbar-buttons--actions">
          {canSave && this.user.isGrafanaAdmin && (
            <DashNavButton
              tooltip="Add panel"
              classSuffix="add-panel"
              icon="gicon gicon-add-panel"
              onClick={onAddPanel}
            />
          )}

          {canStar && this.user.isGrafanaAdmin && (
            <DashNavButton
              tooltip="Mark as test"
              classSuffix="star"
              icon={`${isStarred ? 'fa fa-star' : 'fa fa-star-o'}`}
              onClick={this.onStarDashboard}
            />
          )}

          {canShare && this.user.isGrafanaAdmin && (
            <DashNavButton
              tooltip="Share dashboard"
              classSuffix="share"
              icon="fa fa-share-square-o"
              onClick={this.onOpenShare}
            />
          )}

          {canSave && this.user.isGrafanaAdmin && (
            <DashNavButton tooltip="Save dashboard" classSuffix="save" icon="fa fa-save" onClick={this.onSave} />
          )}

          {snapshotUrl && this.user.isGrafanaAdmin && (
            <DashNavButton
              tooltip="Open original dashboard"
              classSuffix="snapshot-origin"
              icon="gicon gicon-link"
              href={snapshotUrl}
            />
          )}

          {showSettings && this.user.isGrafanaAdmin && (
            <DashNavButton
              tooltip="Dashboard settings"
              classSuffix="settings"
              icon="gicon gicon-cog"
              onClick={this.onOpenSettings}
            />
          )}
        </div>

        {this.user.isGrafanaAdmin && (
          <div className="navbar-buttons navbar-buttons--tv">
            <DashNavButton
              tooltip="Cycle view mode"
              classSuffix="tv"
              icon="fa fa-desktop"
              onClick={this.onToggleTVMode}
            />
          </div>
        )}

        {!dashboard.timepicker.hidden && (
          <div className="navbar-buttons">
            <DashNavTimeControls
              $injector={$injector}
              dashboard={dashboard}
              location={location}
              updateLocation={updateLocation}
            />
          </div>
        )}

        <div className="navbar-buttons" id="fullScreen">
          <DashNavButton tooltip="Full screen" classSuffix="tv" icon="fa fa-arrows-alt" onClick={this.onFullScreen} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  location: state.location,
});

const mapDispatchToProps = {
  updateLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashNav);
