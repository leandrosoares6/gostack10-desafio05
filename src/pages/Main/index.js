import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    newRepo: '',
    message: 'Adicionar repositório',
    repositories: [],
    loading: false,
    repoNotFound: false,
  };

  // Carregar dados do localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // Salvar os dados no localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    try {
      const response = await api.get(`/repos/${newRepo}`);
      const data = {
        name: response.data.full_name,
      };

      // eslint-disable-next-line array-callback-return
      repositories.map(repository => {
        if (repository.name === data.name) {
          throw new Error();
        }
      });

      return this.setState({
        loading: false,
        repoNotFound: false,
        newRepo: '',
        message: 'Adicionar repositório',
        repositories: [...repositories, data],
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return this.setState({
          loading: false,
          newRepo: '',
          message: 'Repositório não encontrado',
          repoNotFound: true,
        });
      }

      return this.setState({
        loading: false,
        newRepo: '',
        message: 'Repositório duplicado',
      });
    }
  };

  render() {
    const {
      newRepo,
      message,
      repositories,
      loading,
      repoNotFound,
    } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} repoNotFound={repoNotFound}>
          <input
            type="text"
            placeholder={message}
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
