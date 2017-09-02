import * as service from './service';
import { AsyncStorage } from 'react-native'

export default {
  namespace: 'zone',
  state: {
    user: {},
    data: {},
    info: {},
    accesstoken: '',
    setting: { draft: true, notic: true },
    loading: false,
  },
  effects: {
    *init({ payload = {} }, { call, put }) {
      var user = yield AsyncStorage.getItem('user')
      var accesstoken = yield AsyncStorage.getItem('accesstoken')
      var setting = yield AsyncStorage.getItem('setting')
      if (user) yield put({ type: 'query', payload: JSON.parse(user) })
      if (accesstoken) yield put({ type: 'token', payload: accesstoken })
      if (setting) yield put({ type: 'config', payload: JSON.parse(setting) })
    },
    *information({ payload = {} }, { call, put }) {
      yield put({ type: 'loading', payload: true });
      const { data, err } = yield call(service.getInfo, payload);
      yield put({ type: 'information/success', payload: data });
      yield put({ type: 'loading', payload: false });
    },
    *login({ payload = {} }, { call, put }) {
      const { accesstoken } = payload
      yield put({ type: 'loading', payload: true });
      const { data } = yield call(service.postToken, payload);
      yield put({ type: 'login/success', payload: data });
      AsyncStorage.setItem('accesstoken', accesstoken);
      yield put({ type: 'token', payload: accesstoken });
      const [, user] = data
      yield put({ type: 'query', payload: user });
      yield put({ type: 'loading', payload: false });
    },
    *query({ payload = {} }, { call, put }) {
      yield put({ type: 'loading', payload: true });
      yield put({ type: 'user', payload: payload });
      const { data } = yield call(service.queryUser, { user: payload.loginname });
      yield put({ type: 'query/success', payload: data });
      yield put({ type: 'loading', payload: false });
    },
  },
  reducers: {
    'login/success'(state, { payload }) {
      const [, data] = payload
      AsyncStorage.setItem('user', JSON.stringify(data));
      return { ...state, user: data };
    },
    'query/success'(state, { payload }) {
      const [, result] = payload
      const data = service.parseUser(result.data)
      return { ...state, data: data };
    },
    'information/success'(state, { payload }) {
      const [, data] = payload
      const info = service.parseInformation(data)
      return { ...state, info };
    },
    'loading'(state, { payload: data }) {
      return { ...state, loading: data };
    },
    'user'(state, { payload: data = {} }) {
      return { ...state, user: data };
    },
    'token'(state, { payload: data }) {
      return { ...state, accesstoken: data };
    },
    'config'(state, { payload: data = {} }) {
      AsyncStorage.setItem('setting', JSON.stringify(data));
      return { ...state, setting: data };
    },
    'clean'(state, { payload: data }) {
      AsyncStorage.removeItem('user')
      AsyncStorage.removeItem('accesstoken')
      return { ...state, data: {} };
    },
  },
  subscriptions: {},
};
