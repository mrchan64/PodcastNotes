import io
import os
import sys

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json 

# Import nltk package 
#   PennTreeBank word tokenizer 
#   English language stopwords
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords

from sklearn.svm import SVC
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, precision_recall_fscore_support
from sklearn.cluster import MiniBatchKMeans
from sklearn.neighbors import NearestNeighbors

from collections import OrderedDict, Counter

cl = 4

#Download MLTK English tokenizer/stopwords 
#nltk.download('punkt')
#nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

#read in dataset
with io.open('results.txt', 'rb') as file:
	results = file.read()

results = str(results).split(".")

df_results = pd.DataFrame(data=results)
df_results.columns = ['results']


#create TfidfVectorizer object
tfidf = TfidfVectorizer(sublinear_tf=True, analyzer='word', 
						max_features=100, tokenizer=word_tokenize, max_df=0.8)


#print("Transforming dataset")


tf = tfidf.fit_transform(df_results["results"])
tf = tf.toarray() #transformed vectors into a matrix


#Check if dataset shape lines up: for this case should be 10000 and 1000
#print(tf.shape)


#print("plotting datapoints on grid")
#Plot data on a 2 dimensional grid just for visualization purposes
pca = PCA(n_components=2).fit(tf)
data2D = pca.transform(tf) #data2D = number of posts * 2
#plt.show()  

#print("plotting k-means analysis")
#use K-means on data and plot means on PCA graph 
kmeans = MiniBatchKMeans(n_clusters=cl, random_state=1337).fit(tf) #default threshold
centers2D = pca.transform(kmeans.cluster_centers_)

#plt.show()              


#convert clusters back into text
clusters = kmeans.cluster_centers_
#print(clusters)
questions_clusters = tfidf.inverse_transform(X=clusters)

#print(tfidf.get_feature_names())
tfidf_dict = tfidf.vocabulary_

plt.scatter(data2D[:, 0], data2D[:, 1], c=kmeans.labels_)
plt.scatter(centers2D[:,0], centers2D[:,1], 
	marker='x', s=200, linewidths=3, c='r')

#print("all plotted")


#sort sentences based on label/tfidf
df_results["label"] = pd.Series(kmeans.labels_, index = df_results.index)
df_results["time"] = df_results.index

#print(df_results.head())

#plt.show()

#results = list of sentences

'''from nltk.tokenize import RegexpTokenizer
from stop_words import get_stop_words
from nltk.stem.porter import PorterStemmer
from gensim import corpora, models
import gensim

tokenizer = RegexpTokenizer(r'\w+')

# create English stop words list
en_stop = get_stop_words('en')

# Create p_stemmer of class PorterStemmer
p_stemmer = PorterStemmer()
    
# list for tokenized documents in loop
texts = []

# loop through document list
for i in results:
    
    # clean and tokenize document string
    raw = i.lower()
    tokens = tokenizer.tokenize(raw)

    # remove stop words from tokens
    stopped_tokens = [i for i in tokens if not i in en_stop]
    
    # stem tokens
    stemmed_tokens = [p_stemmer.stem(i) for i in stopped_tokens]
    
    # add tokens to list
    texts.append(stemmed_tokens)

# turn our tokenized documents into a id <-> term dictionary
dictionary = corpora.Dictionary(texts)
    
# convert tokenized documents into a document-term matrix
corpus = [dictionary.doc2bow(text) for text in texts]

# generate LDA model
ldamodel = gensim.models.ldamodel.LdaModel(corpus, num_topics=6, id2word = dictionary, passes=20)
print(ldamodel.print_topics(num_topics=6, num_words=6))'''

with io.open('results.txt', 'rb') as file:
	res = file.read()

res = str(res)
print(res)
stopWords = set(stopwords.words("english"))
words = word_tokenize(res)

freqTable = dict()
for word in words:
    word = word.lower()
    if word in stopWords:
        continue
    if word in freqTable:
        freqTable[word] += 1
    else:
        freqTable[word] = 1

sentences = res.split(".")
sentenceValue = np.zeros(len(sentences))
#print(len(sentenceValue))

index = 0
for i in sentences:
	words_in_sent = word_tokenize(i)
	for j in words_in_sent:
		j = j.lower()
		if j in stopWords:
			pass
		else:
			sentenceValue[index] += 1
	index += 1

sumValues = 0
for sentence in sentenceValue:
    sumValues += sentence

# Average value of a sentence from original text
average = int(sumValues/ len(sentenceValue))

labels = df_results['label']
current_label = labels[0]
summary = ''
summary_ind = []
index = 0
for sentence in sentences:
    if sentenceValue[index] > (1.2 * average):
    	words_in_sent = word_tokenize(sentence)
    	filtered_sentence = [w for w in words_in_sent if not w in stop_words]
    	str1 = ' '.join(filtered_sentence)
    	summary +=  " " + str1
    	summary_ind.append(index)

    	if labels[index] != current_label:
    		current_label = labels[index]
    index += 1

#print(summary)



#print(len(df_results['results']))
df_results['score'] = sentenceValue
#print(df_results.head())
df_final = pd.DataFrame()

#print(summary_ind)

for i in summary_ind:
	df_final = df_final.append(df_results.loc[i])

def remove(input_):
	words_in_sent = word_tokenize(input_)
	filtered_sentence = [w for w in words_in_sent if not w in stop_words]
	return ' '.join(filtered_sentence)

df_final['results'] = df_final['results'].apply(remove)

list_res = [df_final[df_final['label'] == i] for i in range(cl)]

df_final = pd.DataFrame()
for i in range(cl):
    list_res[i] = list_res[i].sort_values(by=['score'], ascending=False)

for i in range(cl):
	df_final = df_final.append(list_res[i])
    #print(list_res[i])

return_dict = {}

for i in summary_ind:
	sub_dict = {'text': df_final["results"].loc[i],'wavnum': df_final["time"].loc[i],'score': df_final["score"].loc[i],'label': df_final["label"].loc[i]}
	return_dict['note'+str(i)] = sub_dict

#print(return_dict)
json_file = json.dumps(return_dict)
print(json_file)
sys.stdout.flush()

